'use client';
import {Localize} from '@/components/i18n/LocaleProvider';
import {useEffect,useRef,useState} from 'react';
import {Mic,Square,AudioLines,Headphones} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {grammar} from '@/lib/course';
import {ChineseText} from './ChineseText';
import {AudioButton} from './common';
import {useVoiceRecorder} from '@/hooks/useVoiceRecorder';
import {beginSpeechCapture,stopSpeechPlayback,releaseSpeechResources} from '@/lib/speech-session';
import {requestSpeechMicrophone,stopSpeechMicrophone} from '@/lib/recording-audio';
type Recognition={lang:string;interimResults:boolean;continuous:boolean;onresult:((e:{results:{[n:number]:{[n:number]:{transcript:string}}}})=>void)|null;onerror:((e:{error:string})=>void)|null;onend:(()=>void)|null;start:()=>void;abort:()=>void};
type RecognitionWindow=Window&{SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};
type SpeechResult={accuracy:number;fluency:number;completeness:number;pronunciation:number};
export function SpeakingLab({pinyin,service,signedIn}:{pinyin:boolean;service:boolean;signedIn:boolean}){
 const [phraseId,setPhraseId]=useState('g001'),[operation,setOperation]=useState(''),[message,setMessage]=useState(''),[transcript,setTranscript]=useState(''),[scores,setScores]=useState<SpeechResult|null>(null),[recognitionSupported,setRecognitionSupported]=useState(false);
 const voice=useVoiceRecorder(20000),replay=useRef<HTMLAudioElement|null>(null),recognizer=useRef<Recognition|null>(null),azure=useRef<(()=>void)[]>([]),cloudMic=useRef<MediaStream|null>(null),lease=useRef<(()=>void)|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),alive=useRef(true),abort=useRef<AbortController|null>(null),generation=useRef(0);
 const phrase=grammar.find(g=>g.id===phraseId)!,busy=operation||(voice.phase==='idle'?'':voice.phase);
 function release(){
  generation.current++;if(timer.current)clearTimeout(timer.current);timer.current=null;
  const r=recognizer.current,close=azure.current,stream=cloudMic.current,end=lease.current,request=abort.current;
  recognizer.current=null;azure.current=[];cloudMic.current=null;lease.current=null;abort.current=null;
  if(r){r.onend=null;r.onresult=null;r.onerror=null;}
  releaseSpeechResources(()=>r?.abort(),...close.reverse(),()=>stopSpeechMicrophone(stream),end,()=>request?.abort());
 }
 useEffect(()=>{alive.current=true;const w=window as RecognitionWindow;setRecognitionSupported(!!(w.SpeechRecognition||w.webkitSpeechRecognition));return()=>{alive.current=false;release()}},[]);
 useEffect(()=>{const player=replay.current;return()=>{player?.pause();}},[voice.url,busy]);
 function resetResults(){setScores(null);setTranscript('');setMessage('');replay.current?.pause();}
 function cancel(){release();voice.cancel();setOperation('');setMessage('Đã dừng luyện nói.');}
 async function record(){if(busy)return;resetResults();await voice.start();}
 function transcribe(){
  if(busy)return;const w=window as RecognitionWindow,Ctor=w.SpeechRecognition||w.webkitSpeechRecognition;if(!Ctor)return;
  resetResults();const run=++generation.current;
  try{lease.current=beginSpeechCapture();const r=new Ctor();recognizer.current=r;r.lang='zh-CN';r.continuous=false;r.interimResults=false;
   r.onresult=e=>{if(alive.current&&run===generation.current){setTranscript(e.results[0][0].transcript);setMessage('Đây là văn bản nhận diện, không phải điểm phát âm.');}};
   r.onerror=e=>{if(alive.current&&run===generation.current)setMessage(e.error==='not-allowed'?'Micro chưa được cấp quyền.':'Chưa nhận được giọng nói rõ. Hãy thử lại.');};
   r.onend=()=>{if(run===generation.current){release();if(alive.current)setOperation('');}};
   r.start();setOperation('recognizing');timer.current=setTimeout(()=>{if(run===generation.current){release();if(alive.current)setOperation('');}},20000);
  }catch(e){release();setOperation('');setMessage(e instanceof Error?e.message:'Chưa khởi động được nhận diện.');}
 }
 async function assess(){
  if(busy||!service||!signedIn)return;resetResults();setOperation('assessing');setMessage('Đang kết nối chấm phát âm…');const run=++generation.current;
  try{
   lease.current=beginSpeechCapture();abort.current=new AbortController();
   const response=await fetch('/api/speech/token',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:abort.current.signal}),credentials=await response.json();if(!response.ok)throw Error(credentials.error);
   const sdk=await import('microsoft-cognitiveservices-speech-sdk');if(!alive.current||run!==generation.current)return;
   const stream=await requestSpeechMicrophone();if(!alive.current||run!==generation.current){stopSpeechMicrophone(stream);return;}cloudMic.current=stream;
   const config=sdk.SpeechConfig.fromAuthorizationToken(credentials.token,credentials.region);config.speechRecognitionLanguage='zh-CN';
   const audioConfig=sdk.AudioConfig.fromStreamInput(stream);azure.current.push(()=>audioConfig.close());
   const r=new sdk.SpeechRecognizer(config,audioConfig);azure.current.push(()=>r.close());
   const assessment=new sdk.PronunciationAssessmentConfig(phrase.zh,sdk.PronunciationAssessmentGradingSystem.HundredMark,sdk.PronunciationAssessmentGranularity.Phoneme,true);assessment.applyTo(r);
   setMessage('Hãy đọc câu mẫu. Âm thanh được gửi tới Azure để đánh giá.');
   const finish=()=>{release();if(alive.current)setOperation('');};
   timer.current=setTimeout(()=>{if(run===generation.current){setMessage('Đã dừng sau 20 giây. Bạn có thể thử lại.');finish();}},20000);
   r.recognizeOnceAsync(result=>{if(!alive.current||run!==generation.current)return;try{if(result.reason===sdk.ResultReason.RecognizedSpeech){const p=sdk.PronunciationAssessmentResult.fromResult(result);setTranscript(result.text);setScores({accuracy:p.accuracyScore,fluency:p.fluencyScore,completeness:p.completenessScore,pronunciation:p.pronunciationScore});setMessage('Kết quả cho lượt đọc này. Chưa có điểm thanh điệu riêng.');}else setMessage('Chưa có kết quả đánh giá hợp lệ. Hãy đọc lại trong môi trường yên tĩnh.');}catch{setMessage('Chưa chấm được lượt đọc. Hãy thử lại.');}finally{finish();}},()=>{if(alive.current&&run===generation.current){setMessage('Chưa chấm được lượt đọc. Hãy thử lại.');finish();}});
  }catch(e){if(run===generation.current){release();if(alive.current){setOperation('');setMessage(e instanceof Error?e.message:'Chưa kết nối được chấm phát âm.');}}}
 }
 return <Localize>{<div className="speaking-layout"><section className="surface speaking-main">
  <div className="row-between"><span className="pill">NGHE · ĐỌC · SO SÁNH</span><select className="form-select" aria-label="Chọn câu luyện nói" value={phraseId} disabled={!!busy} onChange={e=>{stopSpeechPlayback();setPhraseId(e.target.value);resetResults();voice.reset();}}>{grammar.slice(0,36).map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select></div>
  <div className="speaking-phrase"><span className="eyebrow">THỬ NÓI CÂU NÀY</span><h2 lang="zh-Hans">{phrase.zh}</h2>{pinyin&&<span className="pinyin">{phrase.pinyin}</span>}<p>{phrase.vi}</p><AudioButton text={phrase.zh} pinyin={phrase.pinyin} label="Nghe mẫu" variant="outline" disabled={!!busy}/></div>
  <div className={'microphone-stage '+(voice.phase==='recording'?'recording':'')}><Button className="mic-button" size="icon" disabled={!!busy&&voice.phase!=='recording'} aria-label={voice.phase==='recording'?'Dừng ghi âm':'Bắt đầu ghi âm'} onClick={()=>voice.phase==='recording'?voice.stop():void record()}>{voice.phase==='recording'?<Square/>:<Mic/>}</Button><strong>{voice.phase==='recording'?'Đang ghi âm… nhấn để dừng':voice.phase==='processing'?'Đang chuẩn bị bản ghi…':voice.phase==='requesting'?'Đang mở micro…':'Nhấn để ghi âm giọng của bạn'}</strong><p>Tối đa 20 giây · Khử nhiễu và cân bằng âm lượng</p></div>
  {voice.url&&!busy&&<audio ref={replay} controls src={voice.url} className="recording-player" aria-label="Nghe lại bản ghi của bạn"/>}
  {busy&&voice.phase!=='recording'&&<Button variant="ghost" onClick={cancel}>Dừng luyện nói</Button>}
  <p role="status" className="speech-message">{message||voice.message}</p>
  {transcript&&<div className="transcript"><span className="eyebrow">VĂN BẢN NHẬN DIỆN</span><p><ChineseText text={transcript}/></p></div>}
  {scores&&<div className="speech-scores">{Object.entries(scores).filter(([,v])=>Number.isFinite(v)).map(([key,value])=><div key={key}><strong>{Math.round(value)}</strong><small>{({accuracy:'Độ chính xác',fluency:'Độ trôi chảy',completeness:'Độ đầy đủ',pronunciation:'Phát âm tổng thể'} as Record<string,string>)[key]}</small></div>)}</div>}
 </section><aside className="stack"><section className="surface"><AudioLines className="feature-icon"/><h3>Nhận diện lời nói</h3><p>Kiểm tra thiết bị nghe được câu gì. Dịch vụ của trình duyệt có thể xử lý âm thanh trực tuyến.</p><Button variant="outline" disabled={!!busy||!recognitionSupported} onClick={transcribe}>{recognitionSupported?'Nói để nhận diện':'Trình duyệt chưa hỗ trợ'}</Button><small>Không dùng văn bản nhận diện để chấm thanh điệu.</small></section><section className="surface"><Headphones className="feature-icon"/><h3>Đánh giá phát âm</h3><p>Đọc câu mẫu để nhận kết quả từ Azure Speech.</p><Button disabled={!!busy||!service||!signedIn} onClick={()=>void assess()}>{service?'Bắt đầu đánh giá':'Chưa kết nối Azure'}</Button><small>Âm thanh chỉ được gửi khi bạn bắt đầu đánh giá.</small></section></aside></div>}</Localize>;
}
