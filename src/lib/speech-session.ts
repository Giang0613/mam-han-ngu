let playback:{owner:symbol;stop:()=>void}|null=null;
let capture:symbol|null=null;
export function releaseSpeechResources(...cleanup:((()=>void)|null|undefined)[]){
 for(const release of cleanup){try{release?.();}catch{/* A closed resource must not prevent the remaining cleanup. */}}
}
export function stopSpeechPlayback(owner?:symbol){if(playback&&(!owner||playback.owner===owner)){const current=playback;playback=null;releaseSpeechResources(current.stop);}}
export function registerSpeechPlayback(owner:symbol,stop:()=>void){playback={owner,stop};}
export function clearSpeechPlayback(owner:symbol){if(playback?.owner===owner)playback=null;}
export function isSpeechCapturing(){return capture!==null;}
export function beginSpeechCapture(){
 if(capture)throw Error('Micro đang được dùng ở phần luyện khác. Hãy dừng lượt đó trước.');
 stopSpeechPlayback();const owner=Symbol('microphone');capture=owner;
 return()=>{if(capture===owner)capture=null;};
}
