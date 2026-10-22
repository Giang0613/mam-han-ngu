import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import keys from '../src/lib/hsk/material-answer-keys.json';
import {materialAnswerKey,gradeMaterialAnswer,normalizeMaterialAnswer,materialAnswerParts,nextMaterialSubmission,canSubmitMaterialAnswer,MATERIAL_ANSWER_REVISION,type MaterialAnswerKey} from '../src/lib/hsk/material-grading';
import {materialAnswerLayout} from '../src/lib/hsk/material-answer-layout';
import type {NativeMaterialPage} from '../src/lib/hsk/materials-catalog';

const key=(page:string,id:string)=>{const k=materialAnswerKey(id,page);assert.ok(k,`${page}:${id}`);return k};
const result=(answer:string,k:MaterialAnswerKey)=>gradeMaterialAnswer(answer,k)[0].outcome;
const final=key('workbook-018','native-workbook-018-edited-4-item-0');
assert.equal(result('ao',final),'incorrect');for(const a of ['u','ū','u1','zū','zu1','u\u0304'])assert.equal(result(a,final),'correct');
assert.equal(result('u2',final),'incorrect');assert.equal(result('',final),'empty');
const tone=key('workbook-019','native-workbook-019-edited-0-item-0');
for(const a of ['1','che1','chē','che\u0304'])assert.equal(result(a,tone),'correct');
for(const a of ['che','che2','ché','2'])assert.equal(result(a,tone),'incorrect');
const umlaut=key('workbook-055','native-workbook-055-edited-0-item-4');
for(const a of ['lüè','lve4','lu:e4','B','ｂ'])assert.equal(result(a,umlaut),'correct');
for(const a of ['lue4','luè','lüe2'])assert.equal(result(a,umlaut),'incorrect');
assert.notEqual(normalizeMaterialAnswer('lu4','pinyin'),normalizeMaterialAnswer('lv4','pinyin'));
assert.equal(result('hao3',key('workbook-064','native-mark-0')),'correct');
assert.equal(result('hao3',key('workbook-073','native-mark-0')),'incorrect');
assert.equal(result('dui4',key('workbook-073','native-mark-0')),'correct');
const fill=key('textbook-040','native-textbook-040-58');assert.equal(fill.slots.length,2);
assert.deepEqual(gradeMaterialAnswer('呢\n没',fill).map(r=>r.outcome),['correct','correct']);
assert.deepEqual(gradeMaterialAnswer('呢\n',fill).map(r=>r.outcome),['correct','empty']);
assert.deepEqual(materialAnswerParts('B,C,B',3),['B','C','B']);assert.deepEqual(materialAnswerParts('BCB',3),['B','C','B']);
assert.equal(result('C',key('workbook-023','native-workbook-023-question-1')),'incorrect');
assert.equal(result('B',key('workbook-023','native-workbook-023-question-1')),'correct');
assert.equal(result('十二',key('textbook-035','native-textbook-035-number-12')),'correct');
assert.equal(result('12',key('textbook-035','native-textbook-035-number-12')),'incorrect');
assert.equal(result('十二点三十分',key('textbook-060','native-textbook-060-warmup-1')),'correct');
assert.equal(result('十二点一刻',key('textbook-060','native-textbook-060-warmup-1')),'incorrect');
assert.equal(canSubmitMaterialAnswer('你好',true,true),false);assert.equal(canSubmitMaterialAnswer('你好',false,true),true);assert.equal(canSubmitMaterialAnswer(' ',false,true),false);
const first=nextMaterialSubmission(undefined,'ao','2026-10-07T00:00:00Z');
const repeat=nextMaterialSubmission(first,'ao','2026-10-07T00:01:00Z');assert.equal(repeat.attempts,1);
const corrected=nextMaterialSubmission(repeat,'ū','2026-10-07T00:02:00Z');assert.equal(corrected.firstAnswer,'ao');assert.equal(corrected.attempts,2);assert.equal(corrected.revision,MATERIAL_ANSWER_REVISION);
const reloaded=JSON.parse(JSON.stringify(corrected));assert.equal(result(reloaded.answer,final),'correct');assert.equal(reloaded.firstAnswer,'ao');

const audit=JSON.parse(readFileSync('data/hsk1-materials/editorial/answer-key-audit.json','utf8'));
const cache=new Map<string,NativeMaterialPage>();let questions=0;
for(const [identity,raw] of Object.entries(keys)){
 const k=raw as MaterialAnswerKey;assert.equal(identity.slice(0,identity.indexOf(':')),k.pageId);
 const p=cache.get(k.pageId)||JSON.parse(readFileSync(`data/hsk1-materials/native/${k.pageId}.json`,'utf8')) as NativeMaterialPage;cache.set(k.pageId,p);
 const block=p.blocks.find(b=>b.id===k.blockId);assert.ok(block,identity);
 const projected=materialAnswerLayout(block,p.id);const responseKey=identity.slice(identity.indexOf(':')+1);
 assert.ok(projected.responseKey===responseKey||projected.items.some(i=>i.responseKey===responseKey||i.extraResponses?.includes(responseKey)),identity);
 assert.ok(audit.sources.some((s:{id:string})=>s.id===k.source));assert.ok(k.sourcePage>0);
 for(const slot of k.slots){questions++;assert.ok(slot.accepted.length);assert.ok(slot.explanation.length>15);assert.equal(gradeMaterialAnswer(k.slots.map(s=>s.accepted[0]).join('\n'),k).some(r=>r.outcome!=='correct'),false)}
}
assert.equal(questions,792);assert.equal(Object.keys(keys).length,697);
for(const source of audit.sources.filter((s:{url?:string})=>s.url))assert.equal(createHash('sha256').update(readFileSync(`public/hsk1-materials/reference/${source.id}.pdf`)).digest('hex'),source.sha256);
const ghost=materialAnswerLayout(JSON.parse(readFileSync('data/hsk1-materials/native/workbook-043.json','utf8')).blocks.find((b:{id:string})=>b.id==='workbook-043-block-2'),'workbook-043');
assert.equal(ghost.items.filter(i=>i.responseKey).length,3);assert.deepEqual(ghost.items.filter(i=>i.responseKey).map(i=>i.label),['11','12','13']);
assert.equal(materialAnswerKey('native-textbook-053-61','textbook-053'),undefined);
console.log(`PASS: ${questions} source-aligned answers; wrong answers/tones, numeric and Unicode pinyin, ü, page-local keys, empty groups, IME guard, first/retry/reload state, duplicate-field retirement and frozen publisher PDFs.`);
