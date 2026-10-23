'use client';
import {useEffect,useRef,useState} from 'react';
import {beginSpeechCapture,releaseSpeechResources} from '@/lib/speech-session';
import {requestSpeechMicrophone,stopSpeechMicrophone,createSpeechRecorder,prepareRecordedAudio} from '@/lib/recording-audio';
type Phase='idle'|'requesting'|'recording'|'processing';
export function useVoiceRecorder(limitMs=20000){
 const [phase,setPhase]=useState<Phase>('idle'),[url,setUrl]=useState(''),[message,setMessage]=useState('');
 const alive=useRef(true),generation=useRef(0),locked=useRef(false),objectUrl=useRef(''),blob=useRef<Blob|null>(null);
 const waiters=useRef<((value:Blob|null)=>void)[]>([]);
 function complete(value:Blob|null){for(const resolve of waiters.current)resolve(value);waiters.current=[];}
 const current=useRef<{recorder:MediaRecorder;stream:MediaStream;timer:ReturnType<typeof setTimeout>}|null>(null),lease=useRef<(()=>void)|null>(null);
 function release(){const session=current.current,end=lease.current;current.current=null;lease.current=null;if(session)clearTimeout(session.timer);releaseSpeechResources(()=>stopSpeechMicrophone(session?.stream),end);}
 function discardRecording(){const previous=objectUrl.current;objectUrl.current='';blob.current=null;if(previous)URL.revokeObjectURL(previous);}
 function cancel(){generation.current++;const session=current.current;if(session){session.recorder.onstop=null;session.recorder.onerror=null;session.recorder.ondataavailable=null;releaseSpeechResources(()=>{if(session.recorder.state!=='inactive')session.recorder.stop();});}release();locked.current=false;complete(null);if(alive.current)setPhase('idle');}
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;cancel();discardRecording()}},[]);
 function stop():Promise<Blob|null>{const r=current.current?.recorder;if(!r&&phase!=='processing')return Promise.resolve(blob.current);const done=new Promise<Blob|null>(resolve=>waiters.current.push(resolve));if(r&&r.state!=='inactive'){setPhase('processing');try{r.stop();}catch{cancel();if(alive.current)setMessage('Ghi âm bị gián đoạn. Hãy kiểm tra micro và thử lại.');}}return done;}
 async function start(){
  if(locked.current)return;locked.current=true;const run=++generation.current;setMessage('');setPhase('requesting');
  try{
   if(!window.MediaRecorder)throw Error('Trình duyệt chưa hỗ trợ ghi âm. Bạn vẫn có thể nghe mẫu.');
   const endCapture=beginSpeechCapture();lease.current=endCapture;
   const stream=await requestSpeechMicrophone();
   if(!alive.current||run!==generation.current){releaseSpeechResources(()=>stopSpeechMicrophone(stream),endCapture);return;}
   let recorder:MediaRecorder;try{recorder=createSpeechRecorder(stream);}catch(e){stopSpeechMicrophone(stream);throw e;}
   const parts:BlobPart[]=[];
   recorder.ondataavailable=e=>{if(run===generation.current&&e.data.size)parts.push(e.data);};
   recorder.onerror=()=>{if(run===generation.current){cancel();if(alive.current)setMessage('Ghi âm bị gián đoạn. Hãy kiểm tra micro và thử lại.');}};
   recorder.onstop=()=>{if(!alive.current||run!==generation.current)return;recorder.onstop=null;recorder.onerror=null;recorder.ondataavailable=null;release();setPhase('processing');
    void prepareRecordedAudio(new Blob(parts,{type:recorder.mimeType})).then(result=>{
     if(!alive.current||run!==generation.current)return;
     discardRecording();blob.current=result.blob;objectUrl.current=URL.createObjectURL(result.blob);setUrl(objectUrl.current);
     setMessage(result.silent?'Bản ghi rất nhỏ hoặc chưa có giọng nói. Đưa micro gần hơn và thử lại.':result.clipped?'Micro thu quá lớn nên có thể bị rè. Đưa micro xa hơn và ghi lại.':'Đã ghi âm. Nghe lại và so sánh với câu mẫu; bản ghi chỉ ở trên thiết bị trong phiên này.');
    }).catch(e=>{if(alive.current&&run===generation.current){discardRecording();setUrl('');setMessage(e instanceof Error?e.message:'Chưa nghe lại được bản ghi.');}})
    .finally(()=>{if(alive.current&&run===generation.current){locked.current=false;complete(blob.current);setPhase('idle');}});
   };
   current.current={recorder,stream,timer:setTimeout(()=>{if(run===generation.current)void stop();},limitMs)};
   recorder.start(250);
   setPhase('recording');
  }catch(e){if(run===generation.current){cancel();if(alive.current)setMessage(e instanceof Error&&e.name==='NotAllowedError'?'Chưa được cấp quyền micro. Bạn vẫn có thể nghe câu mẫu.':e instanceof Error?e.message:'Chưa mở được micro.');}}
 }
 function reset(){cancel();discardRecording();setUrl('');setMessage('');}
 return {phase,url,message,start,stop,cancel,reset,blob};
}
