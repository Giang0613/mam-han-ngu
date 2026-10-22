import assert from 'node:assert/strict';
import fs from 'node:fs';
import {alignReading} from '../src/lib/reading-alignment';
import type {NativeMaterialPage} from '../src/lib/hsk/materials-catalog';
for(const [zh,py,expected] of [['学生','xuésheng','xué sheng'],['老师','lǎoshī','lǎo shī'],['杯子','bēi zi','bēi zi'],['王一飞','Wáng Yīfēi','Wáng Yī fēi'],['这儿','zhèr','zhèr'],['女儿',"nǚ'ér","nǚ'ér"]]){
 const units=alignReading(zh,py);assert.ok(units);assert.equal(units.map(u=>u.text).join(''),zh);assert.equal(units.map(u=>u.reading||'').join(''),expected);
}
assert.equal(alignReading('你好','nǐ'),undefined,'Incomplete reading must not be guessed');
assert.equal(alignReading('这，儿','zhèr'),undefined,'Erhua must not span punctuation');
assert.deepEqual(alignReading('但是声母和韵母拼合组成音节','dàn shì shēng mǔ hé yùn mǔ pīn hé zǔ chéng yīn jié')?.map(u=>u.text),['但是','声母','和','韵母','拼合','组成','音节'],'Phonetic explanations should wrap by words, not split compounds');
const mixed=alignReading('AI小语，你好！','AI Xiǎoyǔ, nǐ hǎo!');assert.ok(mixed);assert.equal(mixed.map(u=>u.text).join(''),'AI小语，你好！');assert.equal(mixed[0].reading,undefined);
let checked=0;const failures:{id:string;zh:string;pinyin:string}[]=[];
for(const f of fs.readdirSync('data/hsk1-materials/native')){const p=JSON.parse(fs.readFileSync('data/hsk1-materials/native/'+f,'utf8')) as NativeMaterialPage;for(const b of p.blocks){const examples=[...b.items,...(b.table?.rows.flatMap((row,ri)=>row.map((zh,ci)=>({id:`${b.id}-cell-${ri}-${ci}`,zh,pinyin:b.table?.readings?.[ri]?.[ci]||''})))||[])];for(const i of examples){if(!/\p{Script=Han}/u.test(i.zh))continue;assert.ok(i.pinyin,`${i.id}: missing pinyin`);const units=alignReading(i.zh,i.pinyin);if(!units){failures.push({id:i.id,zh:i.zh,pinyin:i.pinyin});continue;}assert.equal(units.map(u=>u.text).join(''),i.zh,`${i.id}: characters lost during alignment`);checked++;}}}
fs.writeFileSync('data/hsk1-materials/editorial/alignment-audit.json',JSON.stringify({checked,fallbacks:failures.length,failures},null,2));
console.log(`PASS: compact readings, names, neutral tones, ü, apostrophes, erhua and mixed text. ${checked} course lines align; ${failures.length} retain their original full reading as fallback.`);
