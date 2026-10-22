import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.SUPERWEB_TEST_URL||'http://localhost:3000';
for(const text of ['', 'xin chào', '../local.db', '你'.repeat(2401)]){
 const response=await fetch(`${base}/api/audio?text=${encodeURIComponent(text)}`);
 assert.ok(response.status===400||(text.length>2400&&response.status===431),'Invalid or oversized audio requests must be rejected');
}
const url=`${base}/api/audio?text=${encodeURIComponent('你好！欢迎学习中文。')}`;
const responses=await Promise.all([fetch(url),fetch(url)]),buffers=[];
for(const response of responses){
 if(response.status!==200)throw Error(`Audio HTTP ${response.status}: ${await response.text()}`);
 assert.equal(response.headers.get('content-type'),'audio/wav');
 assert.equal(response.headers.get('x-audio-revision'),'mandarin-xiaoxiao-reference-v6');
 const b=Buffer.from(await response.arrayBuffer());buffers.push(b);
 assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WAVE');
 assert.equal(b.readUInt16LE(20),1);assert.equal(b.readUInt16LE(22),1);assert.equal(b.readUInt32LE(24),24000);assert.equal(b.readUInt16LE(34),16);
 const start=b.indexOf(Buffer.from('data'))+8;assert.ok(start>=44);
 let power=0,peak=0,clipped=0;for(let i=start;i+1<b.length;i+=2){const sample=b.readInt16LE(i)/32768;power+=sample**2;peak=Math.max(peak,Math.abs(sample));if(Math.abs(sample)>.999)clipped++;}
 const seconds=(b.length-start)/48000,rms=Math.sqrt(power/((b.length-start)/2));
 assert.ok(seconds>1&&seconds<15&&rms>.07&&peak<=.881&&clipped===0,`Quiet or clipped audio: ${seconds}s, RMS ${rms}, peak ${peak}`);
 console.log(`Actual Mandarin WAV: ${seconds.toFixed(2)}s, 24kHz mono PCM16, RMS=${rms.toFixed(4)}, peak=${peak.toFixed(4)}, clipped=${clipped}`);
}
assert.deepEqual(buffers[0],buffers[1],'Concurrent identical requests must reuse the same clip');
const cached=await fetch(url);assert.equal(cached.status,200);assert.deepEqual(Buffer.from(await cached.arrayBuffer()),buffers[0]);
const file=process.env.SUPERWEB_TEST_AUDIO_FILE;if(file)await fs.writeFile(file,buffers[0]);
console.log('Audio validation, real synthesis, duplicate requests and replay passed. No learner profile modified.');
for(const rate of ['NaN','0.1','2','Infinity'])assert.equal((await fetch(`${url}&rate=${rate}`)).status,400);
const slow=Buffer.from(await (await fetch(`${url}&rate=0.7`)).arrayBuffer()),fast=Buffer.from(await (await fetch(`${url}&rate=1.2`)).arrayBuffer());
assert.ok(slow.length>buffers[0].length&&buffers[0].length>fast.length,'Native rendering must respect reading speed');assert.notDeepEqual(slow,buffers[0]);
console.log('Native slow/normal/fast synthesis and cache separation passed. Browser playback remains at 1x.');
const single=`${base}/api/audio?v=6&text=${encodeURIComponent('行')}`;
for(const py of ['hang2','xing2'])assert.equal((await fetch(`${single}&py=${py}`)).status,200);
const hang=Buffer.from(await (await fetch(`${single}&py=hang2`)).arrayBuffer()),xing=Buffer.from(await (await fetch(`${single}&py=xing2`)).arrayBuffer());
assert.notDeepEqual(hang,xing,'Polyphonic variants must use different phonemes and cache entries');
for(const py of ['hang9','invalid','ni3 hao3'])assert.equal((await fetch(`${single}&py=${encodeURIComponent(py)}`)).status,400);
console.log('Explicit polyphone audio, distinct caches and invalid pinyin rejection passed.');
