import fs from 'node:fs';
import {CONTENT_VERSION,lessons,words,grammar,levels,exercises} from '../src/lib/course';
import {translate} from '../src/lib/i18n/translate';
// Keep answer IDs and Chinese intact in the self-contained text pack.
const translated={
 levels:levels.map(l=>({...l,title:translate(l.title,'en'),subtitle:translate(l.subtitle,'en')})),
 lessons:lessons.map(l=>({...l,title:translate(l.title,'en')})),
 words:words.map(w=>({...w,vi:translate(w.vi,'en')})),
 grammar:grammar.map(g=>({...g,title:translate(g.title,'en'),formula:translate(g.formula,'en'),vi:translate(g.vi,'en'),note:translate(g.note,'en')})),
 exercises:exercises.map(e=>({...e,prompt:translate(e.prompt,'en'),explanation:translate(e.explanation,'en'),options:e.options?.map(o=>({...o,text:translate(o.text,'en')}))})),
};
fs.writeFileSync('public/offline-course.json',JSON.stringify({version:CONTENT_VERSION+'-en.1',locale:'en',scope:'English text lessons and local practice only',...translated}));
console.log('English offline text pack prepared.');
