'use client';
import {Localize} from '@/components/i18n/LocaleProvider';
import {useEffect,useRef,useState} from 'react';
import {Volume2,Square,LoaderCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useStudyStore} from '@/store/useStudyStore';
import {stopSpeechPlayback,registerSpeechPlayback,clearSpeechPlayback,isSpeechCapturing} from '@/lib/speech-session';

/** Play an exact excerpt of the publisher's recording, without reading the
 * visible prompt or revealing the missing pinyin to the learner. */
export function WorkbookAudioButton({url,label}:{url:string;label:string}){
 const audio=useRef<HTMLAudioElement>(null),owner=useRef(Symbol('workbook-recording'));
 const session=useRef({generation:0,running:false});
 const [state,setState]=useState<'idle'|'loading'|'playing'|'failed'>('idle');
 const announce=useStudyStore(s=>s.announce),muted=useStudyStore(s=>s.data.profile.muted);
 const active=state==='loading'||state==='playing';
 useEffect(()=>{const current=audio.current,token=owner.current,request=session.current;return()=>{request.generation++;request.running=false;current?.pause();clearSpeechPlayback(token)}},[url]);
 useEffect(()=>{if(muted)stopSpeechPlayback(owner.current)},[muted]);
 function stop(){session.current.generation++;session.current.running=false;audio.current?.pause();clearSpeechPlayback(owner.current);setState('idle')}
 async function play(){
  if(active){stop();return;}
  if(muted||isSpeechCapturing()){announce(muted?'Âm thanh đang tắt trong cài đặt.':'Dừng ghi âm trước khi nghe bản thu.');return;}
  const current=audio.current;if(!current)return;
  stopSpeechPlayback();const request=++session.current.generation;session.current.running=true;registerSpeechPlayback(owner.current,stop);setState('loading');
  current.currentTime=0;current.volume=1;
  try{await current.play()}catch(error){if(request===session.current.generation&&audio.current===current&&(error as DOMException).name!=='AbortError'){session.current.running=false;clearSpeechPlayback(owner.current);setState('failed');announce('Chưa phát được audio. Bạn có thể bấm nghe lại.')}}
 }
 return <Localize>{<span className="workbook-audio-control"><audio ref={audio} aria-hidden="true" preload="none" src={url} onPlaying={()=>{if(session.current.running)setState('playing');else audio.current?.pause()}} onPause={()=>{if(audio.current?.paused){session.current.running=false;clearSpeechPlayback(owner.current);setState('idle')}}} onEnded={()=>{if(audio.current?.ended)stop()}} onError={()=>{if(session.current.running){clearSpeechPlayback(owner.current);setState('failed')}}}/>
  <Button type="button" size="sm" variant="outline" aria-label={active?`Dừng: ${label}`:label} aria-busy={state==='loading'} onClick={()=>void play()}>{state==='loading'?<LoaderCircle className="audio-loading" size={16}/>:state==='playing'?<Square size={16}/>:<Volume2 size={16}/>} {state==='loading'?'Đang tải…':state==='playing'?'Dừng':state==='failed'?'Nghe lại':label}</Button>
 </span>}</Localize>;
}
