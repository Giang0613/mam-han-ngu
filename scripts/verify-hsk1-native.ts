import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {materialLearningSections,materialPageId,type NativeMaterialPage} from '../src/lib/hsk/materials-catalog';
const root=path.join(process.cwd(),'data/hsk1-materials/native');
const read=(id:string)=>JSON.parse(fs.readFileSync(path.join(root,id+'.json'),'utf8')) as NativeMaterialPage;
const ids=materialLearningSections.flatMap(l=>Object.entries(l.pages).flatMap(([book,ns])=>ns.map(n=>materialPageId(book as NativeMaterialPage['book'],n))));
assert.equal(ids.length,272);assert.equal(new Set(ids).size,272);
assert.ok(!materialLearningSections.some(l=>l.id===0));
let items=0,answers=0;
for(const id of ids){
 const page=read(id);assert.equal(page.id,id);assert.ok(page.blocks.length,`${id}: empty lesson part`);
 const seen=new Set<string>(),keys:string[]=[];
 for(const b of page.blocks){
  if(b.practiceMode==='with-others'){assert.equal(b.responseKey,undefined,`${id}: hidden group activity still asks for an answer`);assert.ok(b.items.every(i=>!i.responseKey&&!i.extraResponses?.length));}
  assert.ok(b.title);assert.ok(!seen.has(b.id),`${id}: duplicate block ID`);seen.add(b.id);
  assert.ok(b.items.length||b.table?.rows.length||b.soundGroups?.length||b.context,`${id}: empty block`);
  if(b.table)for(const r of b.table.rows)assert.equal(r.length,b.table.columns.length,`${id}: incomplete table row`);
  if(b.responseKey)keys.push(b.responseKey);
  for(const i of b.items){assert.ok(!seen.has(i.id),`${id}: duplicate item ID`);seen.add(i.id);assert.ok(i.zh&&i.vi);assert.notEqual(i.translation,'machine',`${id}: unrevised machine translation`);if(/\p{Script=Han}/u.test(i.zh))assert.ok(i.pinyin,`${id}: Hanzi missing pinyin`);if(i.responseKey)keys.push(i.responseKey);keys.push(...(i.extraResponses||[]));items++;}
 }
 assert.equal(new Set(keys).size,keys.length,`${id}: two answers share a field`);
 assert.ok(keys.length<=120);for(const key of keys)assert.match(key,/^native-[a-z0-9-]{1,80}$/);answers+=keys.length;
 if(page.book!=='textbook')assert.equal(page.audioTracks.length,0,'Workbook audio must not use textbook track numbers');
 assert.ok(!('image' in page),'Native lessons must not carry a scan image');
}
const allText=(id:string)=>JSON.stringify(read(id).blocks);
assert.ok(allText('workbook-014').includes('ü'));
const risingA=read('workbook-008').blocks.flatMap(b=>b.items).find(i=>i.zh==='啊')!;
assert.equal(risingA.pinyin,'á');assert.equal(risingA.audio,true,'The rising a2 pronunciation example must be playable');
assert.ok(allText('workbook-013').includes('yǔ'));
assert.ok(allText('workbook-020').includes('ní hǎo'));
assert.ok(allText('workbook-030').includes('yí gè'));
assert.ok(allText('workbook-039').includes("shí'èr"));
assert.ok(allText('workbook-073').includes('zhuō'));
assert.ok(allText('textbook-030').includes('你工作忙＿＿＿'));
assert.ok(allText('workbook-129').includes('Đồng hồ 8:05'));
assert.equal(read('workbook-134').blocks[0].items.filter(i=>i.responseKey).length,5);
assert.ok(read('writing-015').blocks.some(b=>b.characters?.includes('姐')));
assert.ok(read('workbook-110').blocks.some(b=>b.characters?.includes('分')));
assert.ok(allText('textbook-087').includes('6.02 元'));
assert.ok(allText('textbook-087').includes('202.2 元'));
assert.ok(allText('textbook-062').includes('二十一点十分'));
assert.ok(allText('textbook-061').includes('我上午十点十分有课。'));
assert.ok(allText('textbook-029').includes('Nhớ (người thân, bạn bè)'));
assert.ok(read('workbook-009').blocks.some(b=>b.soundGroups?.length===2));
const rolePlay=read('textbook-018').blocks.find(b=>b.id==='textbook-018-edited-2')!;
assert.equal(rolePlay.practiceMode,'with-others');assert.ok(rolePlay.retiredResponseKeys?.includes('native-textbook-018-edited-2'));
assert.ok(read('textbook-054').blocks.some(b=>b.kind==='exercise'&&b.responseKey&&b.items.filter(i=>!i.practiceMode).length===2),'Real comprehension questions must remain answerable');
assert.ok(read('textbook-031').blocks.some(b=>!b.practiceMode&&b.kind==='phonetics'));
assert.ok(read('textbook-031').blocks.some(b=>!b.practiceMode&&b.title==='Tổng kết bài học'));
for(const word of ['找','开车','车'])assert.ok(read('textbook-094').blocks.some(b=>b.kind==='vocabulary'&&b.items.some(i=>i.zh===word)),'Vocabulary must not disappear with a neighboring role-play instruction');
const component=fs.readFileSync('src/components/study/Hsk1Materials.tsx','utf8');
assert.ok(!/next\/image|<img\b|<Image\b|page\.image|\.pdf\b|material-scan/.test(component),'Learner component still renders page images or PDFs');
console.log(`PASS: 272 native lesson parts, ${items} text items, ${answers} independent answer fields; phonetics, cloze, scenario choices, writing and scan-free learner UI.`);
