import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const directory=process.env.SUPERWEB_SPEECH_OUTPUT;
if(!directory)throw Error('Set SUPERWEB_SPEECH_OUTPUT to the audit artifact directory.');
const cases=JSON.parse(await fs.readFile(`${directory}/cases.json`,'utf8'));
const unique=[...new Map(cases.map(c=>[`${c.text}\0${c.reading||''}`,c])).values()];
const results=[];
for(let i=0;i<unique.length;i++){
 const c=unique[i],params=new URLSearchParams({v:'6',text:c.text,rate:'0.85'});if(c.reading)params.set('py',c.reading);
 const response=await fetch(`http://localhost:3000/api/audio?${params}`);
 assert.equal(response.status,200,`${c.text}: ${await (response.ok?Promise.resolve(''):response.text())}`);
 assert.equal(response.headers.get('x-audio-revision'),'mandarin-xiaoxiao-reference-v6');
 const b=Buffer.from(await response.arrayBuffer()),sr=b.readUInt32LE(24),start=b.indexOf(Buffer.from('data'))+8;
 let power=0,peak=0,clipped=0;
 for(let j=start;j+1<b.length;j+=2){const y=b.readInt16LE(j)/32768;power+=y*y;peak=Math.max(peak,Math.abs(y));clipped+=Number(Math.abs(y)>.999)}
 const samples=(b.length-start)/2,seconds=samples/sr,rms=Math.sqrt(power/samples);
 assert.equal(sr,24000);assert.equal(clipped,0);assert.ok(peak<=.881&&rms>.015&&seconds>.15&&seconds<40,`Bad WAV: ${c.text}`);
 const result={text:c.text,reading:c.reading,seconds,peak,rms,clipped};results.push(result);
 if(i<19)await fs.writeFile(`${directory}/sample-${String(i).padStart(2,'0')}.wav`,b);
 if((i+1)%30===0)console.log(`Real audio ${i+1}/${unique.length} passed.`);
}
await fs.writeFile(`${directory}/audio-audit.json`,JSON.stringify(results,null,2));
console.log(`${results.length} actual WAVs passed; 42 handwriting characters, tone examples, polyphones and course speaking sentences. No clipping / muted clips; this is synthesis validation, not human pronunciation assessment.`);
