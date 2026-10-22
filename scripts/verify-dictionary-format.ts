import assert from 'node:assert/strict';
import fs from 'node:fs';
import {formatDictionaryMeaning,readableDictionaryText} from '../src/lib/dictionary-format';
import {createEnglishLookup} from '../src/lib/dictionary-english';

const entries=JSON.parse(fs.readFileSync('data/cedict.json','utf8'));
const lookup=createEnglishLookup(entries);
const english=(hanzi:string,pinyin:string)=>lookup({hanzi,pinyin,meaning:'original',language:'vi'})!;
const bag=english('包','bāo');
assert.ok(bag.details.definitions.includes('to wrap'));
assert.ok(!bag.meaning.includes('CL:'));
assert.deepEqual(bag.details.classifiers,[{hanzi:'个',traditional:'個',pinyin:'gè'},{hanzi:'只',traditional:'隻',pinyin:'zhī'}]);
const help=english('帮','bāng');assert.ok(help.meaning.startsWith('to help'));
assert.ok(!help.meaning.includes('variant'));
assert.ok(help.details.notes.includes('Older form: 幇 (bāng).'));
assert.ok(help.details.notes.includes('Older form: 幚 (bāng).'));
assert.match(english('杯','bēi').meaning,/classifier for certain containers/,'Retain a lexical definition of a measure word');
const cup=english('杯子','bēizi');assert.equal(cup.meaning,'cup; glass');assert.equal(cup.details.classifiers.length,2);
const index=english('股指','gǔzhǐ');assert.equal(index.meaning,'stock market index; share price index');
assert.ok(index.details.notes.includes('abbr. for 股票指数 (gǔ piào zhǐ shù)'));
assert.equal(readableDictionaryText('Taiwan pr. [bi4]'),'Taiwan pr. bì');
assert.equal(readableDictionaryText('女兒|女儿[nu:3 er2]'),'女儿 (nǚ ér)');
assert.equal(readableDictionaryText('one [optional] word; ratio 1:5'),'one [optional] word; ratio 1:5');
const embedded=formatDictionaryMeaning('pea (CL:顆|颗[ke1],粒[li4]); a sense (a; b)');
assert.deepEqual(embedded.definitions,['pea','a sense (a; b)']);assert.equal(embedded.classifiers.length,2);
assert.deepEqual(formatDictionaryMeaning('cup; CL:個|个[ge4],個|个[ge4]').classifiers,[{hanzi:'个',traditional:'個',pinyin:'gè'}]);
assert.deepEqual(formatDictionaryMeaning('word (CL:个[gè])').classifiers,[{hanzi:'个',pinyin:'gè'}]);
let classifiers=0;
for(const entry of entries){
 const result=formatDictionaryMeaning(entry.meaning);classifiers+=result.classifiers.length;
 const text=[...result.definitions,...result.notes,...result.classifiers.flatMap(c=>[c.hanzi,c.pinyin||''])].join(' ');
 assert.ok(!/\bCL:|\[[^\]]*[A-Za-z:]+[0-5][^\]]*\]|\p{Script=Han}\|\p{Script=Han}/u.test(text),'Raw dictionary notation remains: '+entry.id);
}
assert.ok(classifiers>1500,'Classifiers must be preserved, not just deleted');
console.log(JSON.stringify({entries:entries.length,classifiers,checks:'clean definitions, retained measure words and variant notes, readable references, ü and tone marks, and no raw CC-CEDICT syntax passed'}));
