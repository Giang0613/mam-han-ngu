export const speechConstraints:MediaTrackConstraints={channelCount:{ideal:1},sampleRate:{ideal:48000},echoCancellation:{ideal:true},noiseSuppression:{ideal:true},autoGainControl:{ideal:true}};
export async function requestSpeechMicrophone(media:Pick<MediaDevices,'getUserMedia'>=navigator.mediaDevices){
 if(!media?.getUserMedia)throw Error('Trình duyệt chưa hỗ trợ micro. Bạn vẫn có thể nghe câu mẫu.');
 try{return await media.getUserMedia({audio:speechConstraints});}
 catch(e){if(e instanceof Error&&e.name==='OverconstrainedError')return media.getUserMedia({audio:true});throw e;}
}
export function createSpeechRecorder(stream:MediaStream,Recorder:typeof MediaRecorder=MediaRecorder){
 const mimeType=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4'].find(type=>Recorder.isTypeSupported?.(type));
 return new Recorder(stream,{...(mimeType?{mimeType}:{}),audioBitsPerSecond:128000});
}
export function normalizeVoicePcm(input:Float32Array,sampleRate:number){
 if(!input.length||!Number.isFinite(sampleRate)||sampleRate<=0)throw Error('Bản ghi chưa có âm thanh.');
 let mean=0,originalPower=0,clipped=0;
 for(const x of input){if(!Number.isFinite(x))throw Error('Bản ghi chưa đọc được.');mean+=x;originalPower+=x*x;if(Math.abs(x)>=.999)clipped++;}
 mean/=input.length;const pcm=Float32Array.from(input,x=>x-mean);
 let peak=0,power=0;for(const x of pcm){peak=Math.max(peak,Math.abs(x));power+=x*x;}
 const rms=Math.sqrt(power/pcm.length),silent=rms<.001;
 const gain=silent||!peak?1:Math.min(4,.14/rms,.9/peak);
 for(let i=0;i<pcm.length;i++)pcm[i]*=gain;
 const fade=Math.min(Math.round(sampleRate*.004),Math.floor(pcm.length/2));
 for(let i=0;i<fade;i++){const envelope=i/Math.max(1,fade-1);pcm[i]*=envelope;pcm[pcm.length-1-i]*=envelope;}
 return {pcm,gain,silent,clipped:clipped/input.length>.002,originalRms:Math.sqrt(originalPower/input.length)};
}
export function encodeMonoWav(samples:Float32Array,sampleRate:number){
 const bytes=new ArrayBuffer(44+samples.length*2),v=new DataView(bytes);
 const word=(offset:number,s:string)=>{for(let i=0;i<s.length;i++)v.setUint8(offset+i,s.charCodeAt(i));};
 word(0,'RIFF');v.setUint32(4,36+samples.length*2,true);word(8,'WAVE');word(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sampleRate,true);v.setUint32(28,sampleRate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);word(36,'data');v.setUint32(40,samples.length*2,true);
 for(let i=0;i<samples.length;i++){const x=Math.max(-1,Math.min(1,samples[i]));v.setInt16(44+i*2,Math.round(x*(x<0?32768:32767)),true);}
 return new Blob([bytes],{type:'audio/wav'});
}
export async function prepareRecordedAudio(blob:Blob){
 if(!blob.size)throw Error('Bản ghi trống. Hãy thử nói lại.');
 const Ctor=window.AudioContext||(window as Window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
 if(!Ctor)return {blob,silent:false,clipped:false,normalized:false};
 const context=new Ctor();
 try{
  const decoded=await context.decodeAudioData(await blob.arrayBuffer()),mono=new Float32Array(decoded.length);
  for(let ch=0;ch<decoded.numberOfChannels;ch++){const channel=decoded.getChannelData(ch);for(let i=0;i<mono.length;i++)mono[i]+=channel[i]/decoded.numberOfChannels;}
  const result=normalizeVoicePcm(mono,decoded.sampleRate);
  return {blob:encodeMonoWav(result.pcm,decoded.sampleRate),silent:result.silent,clipped:result.clipped,normalized:true};
 }catch{return {blob,silent:false,clipped:false,normalized:false};}
 finally{await context.close().catch(()=>{});}
}
