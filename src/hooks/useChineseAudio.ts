'use client';
import {useState,useEffect,useCallback,useRef} from 'react';
import {useStudyStore} from '@/store/useStudyStore';
import {speechSample} from '@/lib/speech-reading';
import {chineseSpeechText} from '@/lib/chinese-reading';
import {stopSpeechPlayback,registerSpeechPlayback,clearSpeechPlayback,isSpeechCapturing,releaseSpeechResources} from '@/lib/speech-session';
export type AudioState='idle'|'loading'|'playing'|'failed';
type Callbacks={onStart?:()=>void;onEnd?:()=>void;onError?:()=>void;rate?:number;pinyin?:string};

export function useChineseAudio(){
 const rate=useStudyStore(s=>s.data.profile.rate),muted=useStudyStore(s=>s.data.profile.muted),announce=useStudyStore(s=>s.announce);
 const [state,setState]=useState<AudioState>('idle'),owner=useRef(Symbol('audio')),alive=useRef(true);
 const stop=useCallback(()=>stopSpeechPlayback(owner.current),[]);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;stop()}},[stop]);
 useEffect(()=>{if(muted)stop()},[muted,stop]);
 const speak=useCallback((raw:string,callbacks:Callbacks={})=>{
  if(isSpeechCapturing()){announce('Dừng ghi âm trước khi nghe mẫu để giọng không bị lẫn.');callbacks.onError?.();return false;}
  if(muted){announce('Âm thanh đang tắt. Bạn có thể bật lại trong cài đặt.');callbacks.onError?.();return false;}
  const hanzi=chineseSpeechText(raw);if(!hanzi){announce('Câu này chưa có chữ Hán để đọc.');callbacks.onError?.();return false;}
  const {text,reading}=speechSample(hanzi,callbacks.pinyin),speed=callbacks.rate??rate;
  stopSpeechPlayback();setState('loading');
  const controller=new AbortController();let player:HTMLAudioElement|null=null,objectUrl='',utterance:SpeechSynthesisUtterance|null=null,done=false,fallback=false;
  let timer:ReturnType<typeof setTimeout>|undefined,voiceListener:(()=>void)|undefined;
  const update=(next:AudioState)=>{if(alive.current)setState(next)};
  const release=()=>{
   const audio=player,src=objectUrl,speech=utterance;player=null;objectUrl='';utterance=null;
   if(audio){audio.onended=null;audio.onerror=null;}if(speech){speech.onstart=null;speech.onend=null;speech.onerror=null;}
   clearSpeechPlayback(owner.current);
   releaseSpeechResources(
    ()=>{if(timer)clearTimeout(timer);timer=undefined;},
    ()=>{if(voiceListener)window.speechSynthesis?.removeEventListener('voiceschanged',voiceListener);voiceListener=undefined;},
    ()=>controller.abort(),()=>audio?.pause(),()=>{audio?.removeAttribute('src');audio?.load();},
    ()=>{if(src)URL.revokeObjectURL(src);},()=>{if(speech)window.speechSynthesis?.cancel();},
   );
  };
  const finish=()=>{if(done)return;done=true;release();update('idle');callbacks.onEnd?.()};
  const fail=()=>{if(done)return;done=true;release();update('failed');callbacks.onError?.();announce('Chưa phát được giọng mẫu. Hãy kiểm tra mạng và thử lại.');};
  const cancel=()=>{if(done)return;done=true;release();update('idle');};
  registerSpeechPlayback(owner.current,cancel);
  const started=()=>{if(done)return;if(timer)clearTimeout(timer);update('playing');callbacks.onStart?.()};
  const browserFallback=()=>{
   if(done||fallback)return;if(reading){fail();return;}fallback=true;if(timer)clearTimeout(timer);if(player){player.onended=null;player.onerror=null;player.pause();}const synth=window.speechSynthesis;
   if(!synth){fail();return;}update('loading');
   const tryVoice=()=>{if(done||utterance)return;const voice=synth.getVoices().find(v=>/^zh[-_](CN|SG)/i.test(v.lang))||synth.getVoices().find(v=>/^zh[-_]TW/i.test(v.lang));if(!voice)return;if(voiceListener)synth.removeEventListener('voiceschanged',voiceListener);if(timer)clearTimeout(timer);
    synth.cancel();utterance=new SpeechSynthesisUtterance(text);utterance.voice=voice;utterance.lang='zh-CN';utterance.rate=speed;utterance.volume=1;utterance.pitch=1;
    utterance.onstart=started;utterance.onend=finish;utterance.onerror=fail;timer=setTimeout(fail,15000);synth.speak(utterance);
   };
   voiceListener=tryVoice;synth.addEventListener('voiceschanged',tryVoice);timer=setTimeout(fail,2500);tryVoice();
  };
  // Only Chinese lesson text is requested; microphone recordings stay separate.
  timer=setTimeout(fail,90000);
  void fetch(`/api/audio?v=6&rate=${speed.toFixed(2)}&text=${encodeURIComponent(text)}${reading?`&py=${encodeURIComponent(reading)}`:''}`,{signal:controller.signal}).then(async response=>{
   if(!response.ok)throw Error('audio-unavailable');const blob=await response.blob();if(done)return;
   if(!blob.type.startsWith('audio/')||blob.size<44)throw Error('invalid-audio');
   objectUrl=URL.createObjectURL(blob);player=new Audio(objectUrl);player.playbackRate=1;player.volume=1;player.preservesPitch=true;player.onended=finish;player.onerror=()=>browserFallback();
   await player.play();started();
  }).catch(()=>{if(!done)browserFallback()});
  return true;
 },[rate,muted,announce]);
 return {speak,stop,state};
}
