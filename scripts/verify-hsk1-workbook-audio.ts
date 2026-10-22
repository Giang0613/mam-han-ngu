import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import clips from '../src/lib/hsk/workbook-audio-clips.json';
import {workbookPageAudio,workbookAudioContext,type WorkbookAudioClip} from '../src/lib/hsk/workbook-audio';
import type {NativeMaterialPage} from '../src/lib/hsk/materials-catalog';

const root='data/hsk1-materials';
const source=JSON.parse(fs.readFileSync(`${root}/editorial/workbook-audio-source.json`,'utf8')) as {sourcePage:string;recordings:{id:string;sha256:string}[]};
const audit=JSON.parse(fs.readFileSync(`${root}/editorial/workbook-audio-audit.json`,'utf8')) as {nativeContentHashes:Record<string,string>;decodedSources:{id:string;duration:number}[];assets:{id:string;sha256:string;bytes:number;peak:number}[]};
assert.ok(source.sourcePage.startsWith('https://global.unipus.cn/'),'Use the publisher workbook resource, not a textbook recording with the same number');
assert.equal(source.recordings.length,34);
assert.equal(clips.length,491);
assert.equal(new Set(clips.map(c=>c.id)).size,clips.length,'No duplicate audio controls');
assert.equal(new Set(clips.map(c=>c.url)).size,clips.length,'Every control plays its own reviewed excerpt');
const pages=new Map<string,NativeMaterialPage>();
for(const clip of clips as WorkbookAudioClip[]){
 assert.ok(clip.sourceId.startsWith('wb-'));
 assert.ok(source.recordings.some(s=>s.id===clip.sourceId));
 assert.ok(clip.start>=0&&clip.end>clip.start&&clip.end<=audit.decodedSources.find(s=>s.id===clip.sourceId)!.duration+.001);
 assert.ok(clip.duration>.3&&Math.abs(clip.duration-(clip.end-clip.start))<.03);
 if(!pages.has(clip.pageId))pages.set(clip.pageId,JSON.parse(fs.readFileSync(`${root}/native/${clip.pageId}.json`,'utf8')));
 const page=pages.get(clip.pageId)!,block=page.blocks.find(b=>b.id===clip.blockId);
 assert.ok(block&&block.practiceMode!=='with-others',`${clip.id}: missing or hidden exercise`);
 if(clip.itemId)assert.ok(block.items.some(i=>i.id===clip.itemId&&i.practiceMode!=='with-others'));
 if(clip.tableRow!==undefined)assert.ok(block.table&&clip.tableRow>=0&&clip.tableRow<block.table.rows.length);
 const asset=audit.assets.find(a=>a.id===clip.id)!;
 const bytes=fs.readFileSync(`public${clip.url}`);
 assert.equal(bytes.length,asset.bytes);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
 assert.ok(asset.peak>.015&&asset.peak<1,'An excerpt must contain audible, unclipped speech');
}
// These blanks are the learner's actual reported failure: each needs its own
// real audio, while the visible incomplete pinyin and response keys stay intact.
const reported=pages.get('workbook-018')!;
for(const [id,count] of [['workbook-018-edited-3',12],['workbook-018-edited-4',15]] as const){
 const b=reported.blocks.find(b=>b.id===id)!;
 assert.equal(b.items.length,count);
 assert.equal(clips.filter(c=>c.blockId===id).length,count);
 for(const item of b.items){assert.ok(item.zh.includes('＿＿＿'));assert.equal(clips.filter(c=>'itemId' in c&&c.itemId===item.id).length,1);}
 assert.equal(workbookAudioContext(b.context,true),undefined,'Remove the obsolete unavailable-audio message only after real audio is provided');
}
for(const filename of fs.readdirSync(`${root}/native`).filter(f=>f.startsWith('workbook-'))){
 const page=JSON.parse(fs.readFileSync(`${root}/native/${filename}`,'utf8')) as NativeMaterialPage;
 const audio=workbookPageAudio(page.id);
 for(const b of page.blocks){
  const available=audio.some(c=>c.blockId===b.id);
  if(/Chưa có bản thu riêng|Bộ âm thanh bạn cung cấp chưa có|Cần bản thu bài tập tương ứng|cần bản thu bài tập/.test(b.context||''))assert.ok(available,`${b.id}: listening exercise still has no audio`);
  if(available)assert.ok(!/chưa có bản thu|cần bản thu bài tập/i.test(workbookAudioContext(b.context,true)||''),`${b.id}: obsolete unavailable-audio note`);
 }
}
for(const [name,hash] of Object.entries(audit.nativeContentHashes))assert.equal(createHash('sha256').update(fs.readFileSync(`${root}/native/${name}`)).digest('hex'),hash,'Audio integration must not rewrite Chinese, pinyin, translations or answer keys');
// Pin the non-sequential source-to-table associations so reordered reading
// columns cannot attach the wrong pronunciation to an otherwise valid button.
const row=(b:string,i:number)=>clips.find(c=>c.blockId===b&&'tableRow' in c&&c.tableRow===i)!;
assert.ok(row('workbook-046-edited-1',4).start<row('workbook-046-edited-1',1).start,'The recording reads zēng/cēng before diàn/tiàn');
assert.ok(row('workbook-011-edited-0',2).start<row('workbook-011-edited-0',1).start,'The recording reads f tones before lōu tones');
console.log('PASS: 491 FLTRP workbook clips, 93 sections, all reported/missing listening exercises covered; unchanged lesson text, pinyin and answer keys.');
