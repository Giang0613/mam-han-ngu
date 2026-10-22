'use client';
import {Localize} from '@/components/i18n/LocaleProvider';
import {useEffect,useState,useRef} from 'react';
import {Button} from '@/components/ui/button';
import {CheckCircle2,Volume2,Square,LoaderCircle,RotateCcw,Lightbulb,ArrowRight} from 'lucide-react';
import {type Exercise,CONTENT_VERSION} from '@/lib/course';
import {useStudyStore} from '@/store/useStudyStore';
import {useChineseAudio} from '@/hooks/useChineseAudio';
import {ExercisePicture} from './ExercisePicture';
import {shuffled} from '@/lib/exercise-shuffle';
import {ChineseText} from './ChineseText';
import {AudioButton} from './common';
import {hasChinese,readingFor,chineseSpeechText} from '@/lib/chinese-reading';

export function ExerciseCard({exercise:e,onNext,nextLabel='Câu tiếp theo'}:{exercise:Exercise;onNext:()=>void;nextLabel?:string}){
 const {data,mutate}=useStudyStore(),{speak,stop,state:audioState}=useChineseAudio();
 const [answer,setAnswer]=useState(''),[selected,setSelected]=useState<number[]>([]),[matches,setMatches]=useState<Record<string,string>>({});
 const [result,setResult]=useState<{correct:boolean;explanation:string}|null>(null),[hint,setHint]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[heard,setHeard]=useState(false);
 const event=useRef({id:'',answer:''}),composing=useRef(false),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false}},[]);
 const actual=e.kind==='order'?selected.map(i=>e.tokens![i]).join(''):e.kind==='matching'?(e.pairs!.every(p=>matches[p.id])?e.pairs!.map(p=>`${p.id}:${matches[p.id]}`).join('|'):''):answer;
 const options=shuffled(e.options||[],e.id+'-options'),tiles=shuffled((e.tokens||[]).map((text,i)=>({text,i})),e.id+'-tiles');
 const rightPairs=shuffled(e.pairs||[],e.id+'-pairs');
 const optionLabel=(o:NonNullable<Exercise['options']>[number])=>o.picture?`Tranh ${String.fromCharCode(65+options.findIndex(x=>x.id===o.id))}`:o.text;
 async function submit(){
  if(!actual||busy||result)return;
  setBusy(true);setError('');
  if(event.current.answer!==actual||!event.current.id)event.current={id:crypto.randomUUID(),answer:actual};
  try{const response=await mutate<{correct:boolean;explanation:string}>({action:'attempt',eventId:event.current.id,exerciseId:e.id,version:CONTENT_VERSION,answer:actual,hint});if(alive.current)setResult(response);}
  catch(err){if(alive.current)setError(err instanceof Error?err.message:'Chưa lưu được đáp án.');}
  finally{if(alive.current)setBusy(false);}
 }
 return <Localize>{<section className={`exercise-view ${e.layout==='paragraph'?'paragraph-exercise':''}`}>
  <div className="exercise-meta"><span className="pill">{{vocabulary:'Từ vựng',grammar:'Ngữ pháp',listening:'Nghe hiểu',writing:'Gõ chữ',reading:'Đọc hiểu',pinyin:'Pinyin'}[e.skill]}</span><span>Từng bước nhỏ. Nhớ lâu hơn.</span></div>
  <h2><ChineseText text={e.prompt}/></h2>
  {e.passage&&<div className="exercise-passage"><ChineseText text={e.passage} pinyin={e.passagePinyin} label="Nghe đoạn văn"/></div>}
  {e.kind==='listening'?<div className="listen-stage">
   <Button className="audio-orb" aria-label={audioState==='loading'||audioState==='playing'?'Dừng câu hỏi':'Nghe câu hỏi'} onClick={()=>audioState==='loading'||audioState==='playing'?stop():speak(e.zh||'',{pinyin:e.pinyin,onEnd:()=>setHeard(true)})}>{audioState==='loading'?<LoaderCircle className="audio-loading" size={26}/>:audioState==='playing'?<Square size={26}/>:<Volume2 size={26}/>}</Button>
   <p>{audioState==='loading'?'Đang chuẩn bị âm thanh…':audioState==='playing'?'Đang đọc; nghe hết đoạn rồi chọn đáp án.':'Âm thanh đọc tiếng Trung để luyện nghe; có thể nghe lại.'}</p>
   {!heard&&<Button variant="link" onClick={()=>setHint(true)}>Không nghe được? Luyện đọc thay thế</Button>}
   {(hint||result)&&<div className="exercise-passage"><ChineseText text={e.zh||''} pinyin={e.pinyin} label="Nghe lại bản chép"/></div>}
  </div>:e.zh&&<div className="question-zh"><ChineseText text={e.zh} pinyin={e.pinyin} label="Nghe câu mẫu"/></div>}
  {(e.kind==='choice'||e.kind==='listening')&&<div role="radiogroup" aria-label="Chọn đáp án" className={`answers ${options.some(o=>o.picture)?'picture-answers':''}`}>
   {options.map(o=><div className="answer-with-audio" key={o.id}><button role="radio" aria-label={optionLabel(o)} aria-checked={answer===o.id} disabled={busy||!!result} className={'answer '+(answer===o.id?'selected':'')+(result&&o.id===e.answer?' right':'')} onClick={()=>setAnswer(o.id)}><span className="radio-dot">{answer===o.id?'●':'○'}</span>{o.picture&&<ExercisePicture name={o.picture} label={o.pictureLabel||o.text}/>}<ChineseText text={optionLabel(o)} pinyin={o.pinyin} audio={false}/>{result&&o.id===e.answer&&<CheckCircle2 size={18}/>}</button>{!o.picture&&hasChinese(o.text)&&<AudioButton text={chineseSpeechText(o.text)} pinyin={o.pinyin} label={`Nghe lựa chọn: ${o.text}`} compact/>}</div>)}
  </div>}
  {e.kind==='matching'&&<><div className="matching-grid">{e.pairs!.map(p=><div className="matching-pair" key={p.id}><ChineseText text={p.left} label={`Nghe câu hỏi: ${p.left}`}/><div><select aria-label={`Ghép: ${p.left}`} value={matches[p.id]||''} disabled={busy||!!result} onChange={v=>setMatches({...matches,[p.id]:v.target.value})}><option value="">Chọn lời đáp…</option>{rightPairs.map(r=><option key={r.id} value={r.id} disabled={Object.entries(matches).some(([left,right])=>left!==p.id&&right===r.id)}>{r.right}{data.profile.pinyin&&hasChinese(r.right)?` · ${readingFor(r.right)}`:''}</option>)}</select>{matches[p.id]&&<ChineseText className="matching-selected" text={rightPairs.find(r=>r.id===matches[p.id])!.right}/>}</div></div>)}</div><details className="answer-listening-bank"><summary>Nghe các lời đáp trước khi ghép</summary>{rightPairs.map(r=><ChineseText text={r.right} key={r.id}/>)}</details></>}
  {e.kind==='order'&&<><div className="sentence-tray" aria-label="Câu đã sắp xếp">{selected.length?selected.map((i,k)=><Button variant="outline" key={i} disabled={busy||!!result} onClick={()=>setSelected(selected.filter((_,j)=>j!==k))}><ChineseText text={e.tokens![i]} audio={false}/></Button>):<span>Chọn từng phần bên dưới để sắp xếp…</span>}</div>{selected.length>0&&<AudioButton text={actual} label="Nghe câu đã sắp xếp"/>}<div className="word-tiles">{tiles.map(t=><div className="word-tile-with-audio" key={t.i}><Button variant="outline" disabled={selected.includes(t.i)||busy||!!result} onClick={()=>setSelected([...selected,t.i])}><ChineseText text={t.text} audio={false}/></Button>{hasChinese(t.text)&&<AudioButton text={t.text} label={`Nghe mảnh câu: ${t.text}`} compact/>}</div>)}</div><Button variant="ghost" disabled={busy||!!result} onClick={()=>setSelected([])}><RotateCcw/>Sắp lại</Button></>}
  {e.kind==='typing'&&<>{e.pinyin&&hasChinese(e.answer)&&!result&&<Button variant="ghost" disabled={busy} onClick={()=>{setHint(true);speak(e.answer,{pinyin:e.pinyin})}}><Volume2/>Nghe gợi ý phát âm</Button>}<input className="hanzi-input" lang="zh-Hans" aria-label="Nhập đáp án bằng chữ Hán" placeholder="Nhập chữ Hán…" value={answer} disabled={busy||!!result} onChange={v=>setAnswer(v.target.value)} onCompositionStart={()=>{composing.current=true}} onCompositionEnd={()=>{composing.current=false}} onKeyDown={v=>{if(v.key==='Enter'&&!composing.current&&!v.nativeEvent.isComposing&&v.nativeEvent.keyCode!==229){v.preventDefault();void submit()}}}/></>}
  {!result&&<div className="hint-row"><Button variant="ghost" size="sm" disabled={busy} onClick={()=>setHint(true)}><Lightbulb size={14}/>Gợi ý</Button>{hint&&<ChineseText text={e.hintText||(e.kind==='order'?e.answer:e.kind==='matching'?'Chọn lời đáp trả lời đúng loại thông tin ở mỗi câu hỏi.':e.kind==='typing'?(e.pinyin||e.answer):`Đáp án tham khảo: ${options.find(o=>o.id===e.answer)?optionLabel(options.find(o=>o.id===e.answer)!):''}`)}/>}</div>}
  {error&&<p className="feedback incorrect" role="alert">{error} Nhấn Kiểm tra để thử lưu lại.</p>}
  {result?<><div className={'feedback '+(result.correct?'correct':'incorrect')} role="status"><strong>{result.correct?'Chính xác!':'Cùng xem lại một chút nhé.'}</strong><p><ChineseText text={result.explanation}/></p>{(e.kind==='order'||e.kind==='typing')&&hasChinese(e.answer)&&<ChineseText className="reference-answer" text={e.answer} label="Nghe đáp án tham khảo"/>}{hint&&<small>Lượt có gợi ý được lưu riêng, chưa tính là nhớ độc lập.</small>}</div><Button size="lg" onClick={onNext}>{nextLabel}<ArrowRight/></Button></>:<Button size="lg" disabled={!actual||busy||(e.kind==='listening'&&!heard&&!hint)} onClick={()=>void submit()}>{busy?'Đang lưu…':'Kiểm tra'}</Button>}
 </section>}</Localize>;
}
