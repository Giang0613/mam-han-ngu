import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as speechSession from '../src/lib/speech-session';
import * as recordingAudio from '../src/lib/recording-audio';

// Execute the maintained modules with deterministic hook/media adapters.
// These unit checks never open a microphone or contact a speech provider.
function deferred<T>(){let resolve!:(value:T)=>void,reject!:(error:unknown)=>void;const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
const same=(left:unknown[]|undefined,right:unknown[])=>left?.length===right.length&&left.every((value,index)=>Object.is(value,right[index]));
function harness(){
 const slots:any[]=[],timers=new Map<number,()=>void>(),urls=new Set<string>(),revoked:string[]=[];
 let cursor=0,timerId=0,urlId=0,dirty=false,mounted=true,lateUpdates=0,entry:()=>any,value:any;
 const pending:(()=>void)[]=[];
 const react={
  useRef(initial:unknown){const index=cursor++;return slots[index]??(slots[index]={current:initial});},
  useState(initial:unknown){const index=cursor++,slot=slots[index]??(slots[index]={value:typeof initial==='function'?initial():initial});return [slot.value,(next:any)=>{if(!mounted){lateUpdates++;return;}const result=typeof next==='function'?next(slot.value):next;if(!Object.is(slot.value,result)){slot.value=result;dirty=true;}}];},
  useEffect(effect:()=>void|(()=>void),deps:unknown[]){const index=cursor++,slot=slots[index]??(slots[index]={});if(!same(slot.deps,deps)){slot.deps=deps;slot.effect=effect;pending.push(()=>{slot.cleanup?.();slot.cleanup=effect();});}},
  useCallback(callback:unknown,deps:unknown[]){const index=cursor++,slot=slots[index]??(slots[index]={});if(!same(slot.deps,deps)){slot.deps=deps;slot.callback=callback;}return slot.callback;},
 };
 const recorders:FakeRecorder[]=[],players:FakeAudio[]=[],streams:{stops:number;getTracks:()=>any[]}[]=[];
 class FakeRecorder{
  state='inactive';mimeType='audio/webm';onstop:any=null;onerror:any=null;ondataavailable:any=null;throwStop=false;throwStart=false;
  constructor(){recorders.push(this);}
  start(){if(this.throwStart)throw Error('recorder-start');this.state='recording';}
  stop(){if(this.throwStop)throw Error('recorder-stop');this.state='inactive';this.ondataavailable?.({data:new Blob(['voice'])});const done=this.onstop;queueMicrotask(()=>done?.());}
 }
 class FakeAudio{
  onended:any=null;onerror:any=null;paused=0;loaded=0;src='';throwPause=false;
  constructor(src=''){this.src=src;players.push(this);}
  play(){return Promise.resolve();}
  pause(){this.paused++;if(this.throwPause)throw Error('audio-pause');}
  removeAttribute(){this.src='';}
  load(){this.loaded++;}
 }
 const state={microphone:()=>Promise.resolve(stream()),prepare:async(blob:Blob)=>({blob,silent:false,clipped:false,normalized:true}),createRecorder:()=>new FakeRecorder(),fetch:async(_url:string,_init:any)=>({ok:true,blob:async()=>new Blob(['x'.repeat(100)],{type:'audio/wav'}),json:async()=>({token:'unit-token',region:'unit-region'})})};
 function stream(){const result={stops:0,getTracks:()=>[{stop:()=>{result.stops++;}}]};streams.push(result);return result as unknown as MediaStream;}
 const jsx=(type:unknown,props:unknown)=>({type,props});
 const dependencies:Record<string,any>={
  react,'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'fragment'},
  '@/lib/speech-session':speechSession,
  '@/lib/recording-audio':{...recordingAudio,requestSpeechMicrophone:()=>state.microphone(),createSpeechRecorder:()=>state.createRecorder(),prepareRecordedAudio:(blob:Blob)=>state.prepare(blob)},
  '@/store/useStudyStore':{useStudyStore:(selector:any)=>selector({data:{profile:{rate:1,muted:0}},announce:()=>{}})},
  '@/lib/speech-reading':{speechSample:(text:string)=>({text})},
  '@/lib/chinese-reading':{chineseSpeechText:(text:string)=>/\p{Script=Han}/u.test(text)?text:''},
  '@/lib/course':{grammar:[{id:'g001',zh:'你好',pinyin:'nǐ hǎo',vi:'hello',title:'Greeting'}]},
  '@/components/i18n/LocaleProvider':{Localize:'localize'},
  '@/components/ui/button':{Button:'button'},
  './ChineseText':{ChineseText:'ChineseText'},'./common':{AudioButton:'AudioButton'},
  'lucide-react':new Proxy({},{get:(_target,key)=>String(key)}),
 };
 const context=vm.createContext({console,Blob,Error,AbortController,queueMicrotask,
  setTimeout:(callback:()=>void)=>{timers.set(++timerId,callback);return timerId;},clearTimeout:(id:number)=>timers.delete(id),
  URL:{createObjectURL:()=>{const url='blob:unit-'+(++urlId);urls.add(url);return url;},revokeObjectURL:(url:string)=>{revoked.push(url);urls.delete(url);}},
  window:{MediaRecorder:FakeRecorder},Audio:FakeAudio,SpeechSynthesisUtterance:class{},fetch:(url:string,init:any)=>state.fetch(url,init),
 });
 function load(file:string){const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  const module={exports:{}};new vm.Script('(function(require,module,exports){'+source+'\n})',{filename:file}).runInContext(context)((name:string)=>{if(!(name in dependencies))throw Error('Unexpected test import '+name);return dependencies[name];},module,module.exports);return module.exports as any;}
 dependencies['@/hooks/useVoiceRecorder']=load('src/hooks/useVoiceRecorder.ts');
 function render(){for(let count=0;count<10;count++){dirty=false;cursor=0;value=entry();while(pending.length)pending.shift()!();if(!dirty)return value;}throw Error('Unit render did not settle');}
 return {state,context,dependencies,slots,timers,urls,revoked,recorders,players,streams,stream,load,
  mount(fn:()=>any){entry=fn;return render();},render,get value(){return value;},get lateUpdates(){return lateUpdates;},
  async flush(){for(let index=0;index<12;index++)await Promise.resolve();if(mounted)render();},
  unmount(){if(!mounted)return;mounted=false;for(const slot of slots)slot.cleanup?.();},
  strictCycle(){for(const slot of slots)slot.cleanup?.();for(const slot of slots)if(slot.effect)slot.cleanup=slot.effect();return render();},
 };
}
function button(tree:any,label:string):any{if(!tree||typeof tree!=='object')return;if(tree.type==='button'&&tree.props.children===label)return tree.props;for(const item of Object.values(tree.props||{}).flat()){const found=button(item,label);if(found)return found;}}
async function main(){
 // Repeated recordings replace object URLs; reset and unmount own the last URL.
 let h=harness();h.mount(()=>h.dependencies['@/hooks/useVoiceRecorder'].useVoiceRecorder());h.strictCycle();
 for(let count=0;count<3;count++){await h.value.start();h.render();const stopped=h.value.stop();await h.flush();assert.ok(await stopped);assert.equal(h.urls.size,1);assert.ok(!speechSession.isSpeechCapturing());assert.equal(h.timers.size,0);}
 assert.equal(h.revoked.length,2);h.value.reset();h.render();assert.equal(h.urls.size,0);assert.equal(h.value.url,'');h.unmount();assert.equal(h.lateUpdates,0);
 h=harness();h.state.microphone=async()=>{throw Object.assign(Error('denied'),{name:'NotAllowedError'});};h.mount(()=>h.dependencies['@/hooks/useVoiceRecorder'].useVoiceRecorder());await h.value.start();h.render();assert.equal(h.value.phase,'idle');assert.ok(!speechSession.isSpeechCapturing());assert.equal(h.timers.size,0);h.unmount();
 h=harness();const create=h.state.createRecorder;h.state.createRecorder=()=>{const recorder=create();recorder.throwStart=true;return recorder;};h.mount(()=>h.dependencies['@/hooks/useVoiceRecorder'].useVoiceRecorder());await h.value.start();h.render();assert.equal(h.value.phase,'idle');assert.equal(h.streams[0].stops,1);assert.equal(h.timers.size,0);assert.ok(!speechSession.isSpeechCapturing());h.unmount();
 // A pending permission result and a pending decode must not resurrect capture after unmount.
 h=harness();const permission=deferred<MediaStream>();h.state.microphone=()=>permission.promise;h.mount(()=>h.dependencies['@/hooks/useVoiceRecorder'].useVoiceRecorder());
 const opening=h.value.start();h.unmount();const lateStream=h.stream();permission.resolve(lateStream);await opening;assert.equal(h.streams[0].stops,1);assert.ok(!speechSession.isSpeechCapturing());assert.equal(h.lateUpdates,0);
 h=harness();const decode=deferred<any>();h.state.prepare=()=>decode.promise;h.mount(()=>h.dependencies['@/hooks/useVoiceRecorder'].useVoiceRecorder());await h.value.start();h.render();const waiting=h.value.stop();await h.flush();h.unmount();assert.equal(await waiting,null);decode.resolve({blob:new Blob(['late']),silent:false,clipped:false});await h.flush();assert.equal(h.urls.size,0);assert.equal(h.lateUpdates,0);
 // Recorder exceptions still release tracks, waiters, the capture lock and the timer.
 h=harness();h.mount(()=>h.dependencies['@/hooks/useVoiceRecorder'].useVoiceRecorder());await h.value.start();h.render();h.recorders[0].throwStop=true;assert.equal(await h.value.stop(),null);h.render();assert.equal(h.streams[0].stops,1);assert.equal(h.value.phase,'idle');assert.equal(h.timers.size,0);assert.ok(!speechSession.isSpeechCapturing());h.unmount();
 // Already queued old callbacks cannot cancel a new recording.
 h=harness();h.mount(()=>h.dependencies['@/hooks/useVoiceRecorder'].useVoiceRecorder());await h.value.start();h.render();const oldError=h.recorders[0].onerror,oldStop=h.recorders[0].onstop,oldTimer=[...h.timers.values()][0];h.value.cancel();await h.value.start();h.render();oldError();oldStop();oldTimer();assert.equal(h.recorders[1].state,'recording');assert.equal(h.streams[1].stops,0);assert.ok(speechSession.isSpeechCapturing());h.unmount();assert.ok(!speechSession.isSpeechCapturing());
 // In-flight playback cancellation must abort the fetch and ignore its late body.
 h=harness();const audioResponse=deferred<any>();let signal:AbortSignal|undefined;h.state.fetch=(_url,init)=>{signal=init.signal;return audioResponse.promise;};const useAudio=h.load('src/hooks/useChineseAudio.ts').useChineseAudio;h.mount(()=>useAudio());assert.equal(h.value.speak(''),false);assert.equal(h.value.speak('你好'),true);h.unmount();assert.ok(signal?.aborted);audioResponse.resolve({ok:true,blob:async()=>new Blob(['x'.repeat(100)],{type:'audio/wav'})});await h.flush();assert.equal(h.urls.size,0);assert.equal(h.players.length,0);assert.equal(h.lateUpdates,0);assert.equal(h.timers.size,0);
 // A player cleanup exception must not prevent URL revocation or src release.
 h=harness();const audio=h.load('src/hooks/useChineseAudio.ts').useChineseAudio;h.mount(()=>audio());h.value.speak('你好');await h.flush();assert.equal(h.urls.size,1);h.players[0].throwPause=true;h.unmount();assert.equal(h.urls.size,0);assert.equal(h.players[0].src,'');assert.equal(h.players[0].loaded,1);assert.equal(h.timers.size,0);
 // A synthesis timeout must cancel the utterance and remove voice listeners.
 h=harness();let utterance:any,synthesisCancelled=0;const listeners=new Set<unknown>();h.context.window.speechSynthesis={getVoices:()=>[{lang:'zh-CN'}],addEventListener:(_name:string,listener:unknown)=>listeners.add(listener),removeEventListener:(_name:string,listener:unknown)=>listeners.delete(listener),cancel:()=>{synthesisCancelled++;},speak:(speech:unknown)=>{utterance=speech;}};
 h.state.fetch=async()=>{throw Error('audio unavailable');};const Fallback=h.load('src/hooks/useChineseAudio.ts').useChineseAudio;h.mount(()=>Fallback());h.value.speak('你好');await h.flush();assert.ok(utterance);const synthesisTimeout=[...h.timers.values()][0];synthesisTimeout();h.render();assert.ok(synthesisCancelled>=2);assert.equal(utterance.onend,null);assert.equal(utterance.onstart,null);assert.equal(listeners.size,0);assert.equal(h.timers.size,0);h.unmount();
 // Browser recognition abort failure must not retain the capture lock or timeout.
 h=harness();let browser:any;class BrowserRecognizer{onend:any;onresult:any;onerror:any;start(){}abort(){throw Error('already-closed');}constructor(){browser=this;}}
 h.context.window.SpeechRecognition=BrowserRecognizer;const Speaking=h.load('src/components/study/Speaking.tsx').SpeakingLab;h.mount(()=>Speaking({pinyin:true,service:false,signedIn:true}));button(h.value,'Nói để nhận diện').onClick();h.render();assert.ok(speechSession.isSpeechCapturing());h.unmount();assert.ok(!speechSession.isSpeechCapturing());assert.equal(h.timers.size,0);assert.equal(browser.onresult,null);assert.equal(browser.onend,null);assert.equal(h.lateUpdates,0);
 h=harness();h.context.window.SpeechRecognition=BrowserRecognizer;const Timed=h.load('src/components/study/Speaking.tsx').SpeakingLab;h.mount(()=>Timed({pinyin:true,service:false,signedIn:true}));button(h.value,'Nói để nhận diện').onClick();h.render();const timeout=[...h.timers.values()][0];timeout();h.render();assert.ok(!speechSession.isSpeechCapturing());assert.equal(h.timers.size,0);assert.equal(button(h.value,'Nói để nhận diện').disabled,false);h.unmount();
 // Cancellation during a token request must not open the microphone afterwards.
 h=harness();const token=deferred<any>();let tokenSignal:AbortSignal|undefined,microphoneCalls=0;h.state.fetch=(_url,init)=>{tokenSignal=init.signal;return token.promise;};h.state.microphone=()=>{microphoneCalls++;return Promise.resolve(h.stream());};h.dependencies['microsoft-cognitiveservices-speech-sdk']={};
 const Pending=h.load('src/components/study/Speaking.tsx').SpeakingLab;h.mount(()=>Pending({pinyin:true,service:true,signedIn:true}));button(h.value,'Bắt đầu đánh giá').onClick();h.unmount();assert.ok(tokenSignal?.aborted);token.resolve({ok:true,json:async()=>({token:'unit-token',region:'unit-region'})});await h.flush();assert.equal(microphoneCalls,0);assert.equal(h.lateUpdates,0);assert.ok(!speechSession.isSpeechCapturing());
 h=harness();const cloudPermission=deferred<MediaStream>();h.state.microphone=()=>cloudPermission.promise;h.dependencies['microsoft-cognitiveservices-speech-sdk']={};const Delayed=h.load('src/components/study/Speaking.tsx').SpeakingLab;h.mount(()=>Delayed({pinyin:true,service:true,signedIn:true}));button(h.value,'Bắt đầu đánh giá').onClick();await h.flush();h.unmount();cloudPermission.resolve(h.stream());await h.flush();assert.equal(h.streams[0].stops,1);assert.ok(!speechSession.isSpeechCapturing());assert.equal(h.lateUpdates,0);
 // A partial Azure constructor failure must close the audio configuration and microphone.
 h=harness();let audioClosed=0;h.dependencies['microsoft-cognitiveservices-speech-sdk']={SpeechConfig:{fromAuthorizationToken:()=>({})},AudioConfig:{fromStreamInput:()=>({close:()=>audioClosed++})},SpeechRecognizer:class{constructor(){throw Error('constructor');}}};
 const Cloud=h.load('src/components/study/Speaking.tsx').SpeakingLab;h.mount(()=>Cloud({pinyin:true,service:true,signedIn:true}));await button(h.value,'Bắt đầu đánh giá').onClick();await h.flush();assert.equal(audioClosed,1);assert.equal(h.streams[0].stops,1);assert.ok(!speechSession.isSpeechCapturing());h.unmount();
 // An Azure close failure must not skip the remaining cleanup.
 h=harness();audioClosed=0;let closed=0;h.dependencies['microsoft-cognitiveservices-speech-sdk']={SpeechConfig:{fromAuthorizationToken:()=>({})},AudioConfig:{fromStreamInput:()=>({close:()=>audioClosed++})},SpeechRecognizer:class{recognizeOnceAsync(){}close(){closed++;throw Error('already-closed');}},PronunciationAssessmentConfig:class{applyTo(){}},PronunciationAssessmentGradingSystem:{HundredMark:1},PronunciationAssessmentGranularity:{Phoneme:1}};
 const Azure=h.load('src/components/study/Speaking.tsx').SpeakingLab;h.mount(()=>Azure({pinyin:true,service:true,signedIn:true}));await button(h.value,'Bắt đầu đánh giá').onClick();await h.flush();assert.ok(speechSession.isSpeechCapturing());h.unmount();assert.equal(closed,1);assert.equal(audioClosed,1);assert.equal(h.streams[0].stops,1);assert.equal(h.timers.size,0);assert.ok(!speechSession.isSpeechCapturing());assert.equal(h.lateUpdates,0);
 console.log('PASS: actual hook/component cleanup under deterministic adapters: repeated URL replacement, strict-effect replay, cancellation, delayed permission/decode/playback, stale callbacks, recorder/recognizer/SDK failures, tracks, timers and capture locks. No microphone or cloud requests.');
}
void main().catch(error=>{console.error(error);process.exitCode=1;});
