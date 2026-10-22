import fs from 'node:fs';import {formatDictionaryMeaning} from '../src/lib/dictionary-format';
const data=JSON.parse(fs.readFileSync('data/cedict.json','utf8'));let failures=[];let count=0;
for(const w of data){const p=formatDictionaryMeaning(w.meaning);const text=[...p.definitions,...p.notes,...p.classifiers.map((c:any)=>c.hanzi+' '+c.pinyin)].join(' ');if(/CL:|\[[^\]]*[A-Za-z:]+[0-5][^\]]*\]|\p{Script=Han}\|\p{Script=Han}/u.test(text))failures.push({hanzi:w.hanzi,raw:w.meaning,parsed:p});count+=p.classifiers.length;}
console.log(JSON.stringify({entries:data.length,classifiers:count,failures:failures.length,samples:failures.slice(0,12)},null,2));
