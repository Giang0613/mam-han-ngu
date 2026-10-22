import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {materialBooks,materialSections,validMaterialPageId,type MaterialPage} from '../src/lib/hsk/materials-catalog';
import originalAudioIndex from '../src/lib/hsk/material-audio-index.json';
const root=path.join(process.cwd(),'data','hsk1-materials');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
let lines=0;
for(const book of materialBooks){
 const assigned=materialSections.flatMap(l=>l.pages[book.id]);assert.equal(assigned.length,book.pages);assert.equal(new Set(assigned).size,book.pages);assert.deepEqual([...assigned].sort((a,b)=>a-b),Array.from({length:book.pages},(_,i)=>i+1));
 const m=manifest.books.find((b:{id:string})=>b.id===book.id);assert.equal(createHash('sha256').update(fs.readFileSync(path.join(process.cwd(),'public',m.file))).digest('hex'),m.sha256,'Original PDF changed');
 for(const n of assigned){const id=`${book.id}-${String(n).padStart(3,'0')}`,p=JSON.parse(fs.readFileSync(path.join(root,'pages',id+'.json'),'utf8')) as MaterialPage;assert.ok(validMaterialPageId(id));assert.equal(p.id,id);assert.ok(fs.statSync(path.join(process.cwd(),'public',p.image)).size>0);assert.equal(new Set(p.lines.map(l=>l.id)).size,p.lines.length);for(const l of p.lines){assert.ok(l.zh&&l.pinyin&&l.vi,`${id}: missing reading support`);assert.ok(!/<script/i.test(l.vi));lines++;}}
}
for(const a of manifest.audio){const file=fs.readFileSync(path.join(process.cwd(),'public',a.file));assert.equal(file.length,a.bytes);assert.equal(createHash('sha256').update(file).digest('hex'),a.sha256);assert.ok(originalAudioIndex.some(t=>t.lesson===a.lesson&&t.track===a.track&&t.url===a.file));}
assert.equal(manifest.audio.length,93);assert.equal(materialSections.length,17);
const phonetics=JSON.parse(fs.readFileSync(path.join(root,'pages','workbook-008.json'),'utf8')) as MaterialPage;
assert.equal(phonetics.lines.find(l=>l.zh==='啊')?.pinyin,'á');assert.equal(phonetics.lines.find(l=>l.zh==='啊')?.audio,true);
assert.equal(phonetics.lines.find(l=>l.id==='workbook-008-56')?.zh,'菜');assert.equal(phonetics.lines.find(l=>l.id==='workbook-008-56')?.pinyin,'cài');
for(const id of ['textbook-000','writing-016','workbook-140','../textbook-001','textbook-1'])assert.equal(validMaterialPageId(id),false);
console.log(`PASS: all 298 pages assigned exactly once, 3 exact PDFs, 93 exact MP3s, ${lines} Chinese lines with pinyin/Vietnamese. Linguistic review is separate.`);
