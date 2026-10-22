import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {materialLessons,type NativeMaterialPage} from '../src/lib/hsk/materials-catalog';
const root=path.join(process.cwd(),'data/hsk1-materials');
type Anchor={lesson:number;track:number;page:number;row:number;text:string;kind:'dialogue'|'vocabulary'|'phonetics'};
const anchors:Anchor[]=[];
// Only an explicit listening/reading instruction or vocabulary heading denotes
// an MP3. Bonus video IDs and group sizes are unrelated numbering systems.
for(const lesson of materialLessons)for(const page of lesson.pages.textbook){
 const raw=JSON.parse(fs.readFileSync(path.join(root,'ocr/textbook',String(page).padStart(3,'0')+'.json'),'utf8'));
 raw.rows.forEach((r:{text:string},row:number)=>{
  if(!/朗读对话|听两遍对话|生词.*New\s*Words|Shadow\s*the\s*Tongue\s*Twister/i.test(r.text))return;
  for(const m of r.text.matchAll(/(?<!\d)(1[0-5]|[1-9])\s*[-–—]\s*([1-7])(?!\d)/g)){
   assert.equal(Number(m[1]),lesson.id,'Audio marker crosses lesson boundary');
   anchors.push({lesson:lesson.id,track:Number(m[2]),page,row,text:r.text,kind:/生词/.test(r.text)?'vocabulary':/Twister/i.test(r.text)?'phonetics':'dialogue'});
  }
 });
}
assert.equal(anchors.length,93);assert.equal(new Set(anchors.map(a=>`${a.lesson}-${a.track}`)).size,93);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
const index=anchors.sort((a,b)=>a.lesson-b.lesson||a.track-b.track).map(a=>{
 const lesson=materialLessons.find(l=>l.id===a.lesson)!;
 const section=Math.ceil(a.track/2),partner=anchors.find(b=>b.lesson===a.lesson&&b.track===a.track+1);
 const end=a.kind==='dialogue'?partner!.page:a.kind==='vocabulary'?(partner?.kind==='dialogue'?Math.max(a.page,partner.page-1):lesson.pages.textbook.at(-1)!):a.page;
 const pages=lesson.pages.textbook.filter(n=>n>=a.page&&n<=end).filter(n=>{
  if(n===a.page)return true;
  const native=JSON.parse(fs.readFileSync(path.join(root,'native',`textbook-${String(n).padStart(3,'0')}.json`),'utf8')) as NativeMaterialPage;
  return native.blocks.some(b=>a.kind==='dialogue'?b.items.some(i=>i.role==='utterance'||i.speaker):b.kind==='vocabulary');
 });
 const id=`${String(a.lesson).padStart(2,'0')}-${a.track}`,url=`/hsk1-materials/audio/${id}.mp3`;
 const original=manifest.audio.find((m:{lesson:number;track:number})=>m.lesson===a.lesson&&m.track===a.track);
 assert.ok(original,`${id}: missing original ZIP entry`);
 const bytes=fs.readFileSync(path.join(process.cwd(),'public',url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),original.sha256,`${id}: file differs from supplied recording`);
 return {lesson:a.lesson,track:a.track,id,url,kind:a.kind,section,title:a.kind==='dialogue'?`Hội thoại ${section}`:a.kind==='vocabulary'?`Từ vựng · Hội thoại ${section}`:'Luyện đọc thanh điệu',markerPage:a.page,pages};
});
for(const lesson of materialLessons)assert.equal(index.filter(a=>a.lesson===lesson.id).length,lesson.id<=3?7:6);
fs.writeFileSync('src/lib/hsk/material-audio-index.json',JSON.stringify(index,null,2)+'\n');
fs.writeFileSync(path.join(root,'editorial/audio-alignment-audit.json'),JSON.stringify({revision:'hsk1-audio-2026-10-07-v2',method:'Explicit audio instruction/heading markers in supplied books; original ZIP import SHA-256 comparison. Not automatic acoustic transcription.',recordings:93,uniqueSourceAnchors:93,matchingOriginalHashes:93,anchors},null,2)+'\n');
console.log('PASS: all 93 original recordings have a unique matching lesson/content marker and unchanged ZIP hash. Bonus video IDs and group sizes excluded.');
