import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {writingCharacters,writingDetail,searchWriting} from '../src/lib/writing-server';
import {vocabularyCorpus} from '../src/lib/hsk/vocabulary-server';
import {writingReadings} from '../src/lib/writing-readings';
const catalog=writingCharacters(),expected=new Set(vocabularyCorpus().entries.flatMap(word=>[...word.hanzi].filter(char=>/\p{Script=Han}/u.test(char))));
assert.equal(catalog.length,3039);assert.deepEqual(new Set(catalog.map(item=>item.character)),expected);
let assetBytes=0;
for(const entry of catalog){
 const file='public/hanzi/'+entry.character+'.json',raw=fs.readFileSync(file),data=JSON.parse(raw.toString());assetBytes+=raw.length;
 assert.equal(data.strokes.length,entry.strokes);assert.equal(data.medians.length,entry.strokes);assert.ok(entry.strokes>0);
 assert.ok(entry.readings.length&&new Set(entry.readings).size===entry.readings.length);
 assert.ok(entry.levels.length&&entry.levels.every(level=>[1,2,3,4,5,6,79].includes(level)));
 assert.ok(entry.wordIds.length&&entry.wordIds.length<=4);
 for(const id of entry.wordIds)assert.ok(vocabularyCorpus().byId.get(id)?.hanzi.includes(entry.character));
 const upstream=fs.readFileSync('node_modules/hanzi-writer-data/'+entry.character+'.json');assert.equal(createHash('sha256').update(raw).digest('hex'),createHash('sha256').update(upstream).digest('hex'));
}
for(const [character,readings] of Object.entries(writingReadings))assert.deepEqual(writingDetail(character)?.readings,readings);
assert.deepEqual(writingDetail('一')?.readings,['yī']);assert.deepEqual(writingDetail('不')?.readings,['bù']);assert.ok(writingDetail('吗')?.readings.includes('ma'));
assert.equal(writingDetail('𠀀'),undefined);assert.ok(writingDetail('学')?.examples.some(word=>word.hanzi.includes('学')));
for(const level of [1,2,3,4,5,6,79]){const result=searchWriting('',level);assert.equal(result.total,catalog.filter(item=>item.levels.includes(level)).length);assert.ok(result.results.every(item=>item.levels.includes(level)));}
for(const stroke of [1,6,11,16])assert.ok(searchWriting('',0,stroke).results.every(item=>item.strokes>=stroke&&(stroke===16||item.strokes<=stroke+4)));
const seen=new Set<string>();for(let page=0;page<Math.ceil(catalog.length/28);page++){const result=searchWriting('',0,0,page);assert.equal(result.hasMore,(page+1)*28<catalog.length);for(const item of result.results){assert.ok(!seen.has(item.character));seen.add(item.character);}}assert.equal(seen.size,catalog.length);
assert.equal(searchWriting('学校').results[0].character==='学'||searchWriting('学校').results[0].character==='校',true);
assert.deepEqual(searchWriting('nǚ').results,searchWriting('nu:3').results);assert.deepEqual(searchWriting('nv3').results,searchWriting('nu:3').results);
assert.equal(searchWriting('zzzzzzzz').total,0);assert.equal(searchWriting('',0,0,999).results.length,0);
const source=JSON.parse(fs.readFileSync('public/hanzi/SOURCE.json','utf8'));assert.equal(source.characters,catalog.length);assert.equal(source.version,'2.0.1');assert.equal(source.license,'Arphic Public License');assert.ok(fs.readFileSync('public/hanzi/LICENSE.txt','utf8').includes('ARPHIC PUBLIC LICENSE'));
console.log(JSON.stringify({characters:catalog.length,assetBytes,checks:'full vocabulary coverage, unmodified local strokes, pinyin/polyphones/neutral tone/ü, examples, HSK bands, stroke filters, exhaustive pagination and provenance passed'}));
