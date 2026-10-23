import assert from 'node:assert/strict';
import {normalizeVoicePcm,encodeMonoWav,requestSpeechMicrophone,stopSpeechMicrophone,createSpeechRecorder,prepareRecordedAudio,speechConstraints} from '../src/lib/recording-audio';
import {beginSpeechCapture,isSpeechCapturing,registerSpeechPlayback,stopSpeechPlayback,clearSpeechPlayback,releaseSpeechResources} from '../src/lib/speech-session';
async function main(){
 const rate=48000,quiet=Float32Array.from({length:rate},(_,i)=>.025*Math.sin(2*Math.PI*220*i/rate)+.004),raised=normalizeVoicePcm(quiet,rate);
 assert.ok(raised.gain>1&&raised.gain<=4);assert.ok(!raised.silent);assert.ok(Math.max(...raised.pcm.map(Math.abs))<=.901);assert.equal(Math.abs(raised.pcm[0]),0);assert.equal(Math.abs(raised.pcm.at(-1)!),0);
 const silent=normalizeVoicePcm(new Float32Array(rate),rate);assert.equal(silent.silent,true);assert.equal(silent.gain,1);
 const saturated=normalizeVoicePcm(Float32Array.from({length:rate},(_,i)=>i%2?1:-1),rate);assert.equal(saturated.clipped,true);assert.ok(Math.max(...saturated.pcm.map(Math.abs))<=.901);
 assert.throws(()=>normalizeVoicePcm(new Float32Array([NaN]),rate));
 const wav=Buffer.from(await encodeMonoWav(raised.pcm,rate).arrayBuffer());assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.readUInt32LE(24),rate);assert.equal(wav.readUInt16LE(22),1);assert.equal(wav.readUInt16LE(34),16);assert.equal(wav.length,44+rate*2);
 let calls=0;const stream={} as MediaStream;
 const fake={getUserMedia:async(c:MediaStreamConstraints)=>{calls++;assert.deepEqual(c.audio,speechConstraints);return stream;}};assert.equal(await requestSpeechMicrophone(fake),stream);assert.equal(calls,1);
 calls=0;const denied={getUserMedia:async()=>{calls++;throw Object.assign(Error('denied'),{name:'NotAllowedError'});}};await assert.rejects(requestSpeechMicrophone(denied),{name:'NotAllowedError'});assert.equal(calls,1);
 calls=0;const constrained={getUserMedia:async(c:MediaStreamConstraints)=>{calls++;if(calls===1)throw Object.assign(Error('constraint'),{name:'OverconstrainedError'});assert.equal(c.audio,true);return stream;}};assert.equal(await requestSpeechMicrophone(constrained),stream);assert.equal(calls,2);
 let options:MediaRecorderOptions|undefined;class FakeRecorder{static isTypeSupported(type:string){return type==='audio/mp4';}constructor(_s:MediaStream,o:MediaRecorderOptions){options=o;}}
 createSpeechRecorder(stream,FakeRecorder as unknown as typeof MediaRecorder);assert.equal(options?.mimeType,'audio/mp4');assert.equal(options?.audioBitsPerSecond,128000);
 let stopped=0;const a=Symbol(),b=Symbol();registerSpeechPlayback(a,()=>stopped++);stopSpeechPlayback(b);assert.equal(stopped,0);const end=beginSpeechCapture();assert.equal(stopped,1);assert.ok(isSpeechCapturing());assert.throws(()=>beginSpeechCapture());end();end();assert.ok(!isSpeechCapturing());
 registerSpeechPlayback(a,()=>stopped++);clearSpeechPlayback(b);stopSpeechPlayback();assert.equal(stopped,2);clearSpeechPlayback(a);
 let released=0;releaseSpeechResources(()=>{throw Error('already closed');},()=>{released++;});assert.equal(released,1);
 stopSpeechMicrophone({getTracks:()=>[{stop:()=>{throw Error('track closed');}},{stop:()=>{released++;}}]} as unknown as MediaStream);assert.equal(released,2);
 registerSpeechPlayback(a,()=>{throw Error('playback closed');});const unlock=beginSpeechCapture();assert.ok(isSpeechCapturing());unlock();assert.ok(!isSpeechCapturing());
 const originalWindow=Object.getOwnPropertyDescriptor(globalThis,'window');let contextsClosed=0;
 try{
  const source=new Blob(['recording']);
  class AudioContextFixture{async decodeAudioData(){throw Error('invalid codec');}async close(){contextsClosed++;}}
  Object.defineProperty(globalThis,'window',{configurable:true,value:{AudioContext:AudioContextFixture}});
  assert.equal((await prepareRecordedAudio(source)).blob,source);assert.equal(contextsClosed,1);
 }finally{if(originalWindow)Object.defineProperty(globalThis,'window',originalWindow);else Reflect.deleteProperty(globalThis,'window');}
 console.log('PASS: recording gain/headroom, silence/clipping, fade, WAV encoding, microphone constraints/denial/fallback, codec/bitrate and playback/capture exclusion. No real microphone opened.');
}
void main().catch(e=>{console.error(e);process.exitCode=1;});
