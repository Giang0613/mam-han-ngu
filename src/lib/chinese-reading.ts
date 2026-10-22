import {pinyin,customPinyin} from 'pinyin-pro';
import {words,grammar,scenarios} from './course';
import {stories} from './reading-data';
import {hskTexts} from './hsk/texts';

export const hasChinese=(text:string)=>/\p{Script=Han}/u.test(text);
// Preserve the course lexicon inside longer, newly generated sentences too.
// Only complete multi-character words are registered, never ambiguous single
// characters (行/还/了 etc.). Skip erhua spellings that do not align 1:1.
const phraseReadings:Record<string,string>={};
const contextSensitive=new Set(['东西','地方','便宜']);
for(const word of words){
 if(contextSensitive.has(word.zh)||!/^\p{Script=Han}{2,}$/u.test(word.zh))continue;
 const syllables=pinyin(word.zh,{type:'array',toneSandhi:false}),source=word.pinyin.normalize('NFC').replace(/[\s']/g,'').toLowerCase();
 if(syllables.reduce((n,s)=>n+s.length,0)!==source.length)continue;
 let offset=0;phraseReadings[word.zh]=syllables.map(s=>{const part=source.slice(offset,offset+s.length);offset+=s.length;return part}).join(' ');
}
customPinyin(phraseReadings);
// Keep authored readings, especially names, neutral tones, and contextual polyphones.
const authored=new Map<string,string>([
 ...words.map(w=>[w.zh,w.pinyin] as [string,string]),
 ...grammar.map(g=>[g.zh,g.pinyin] as [string,string]),
 ...stories.flatMap(s=>s.lines.map(([zh,py])=>[zh,py] as [string,string])),
 ...scenarios.flatMap(s=>s.turns.map(t=>[t.zh,t.py] as [string,string])),
 ...Object.values(hskTexts).flat().filter(t=>t.pinyin).map(t=>[t.text,t.pinyin!] as [string,string]),
]);
for(const [text,reading] of [...authored]){
 const bare=text.replace(/[。！？]+$/u,'');
 if(bare!==text&&!authored.has(bare))authored.set(bare,reading.replace(/[.!?]+$/u,''));
}
const knownReading=(text:string)=>authored.get(text)||authored.get(text.replace(/^[“”‘’（）]+|[“”‘’（）。，！？、；：]+$/gu,''));
const cache=new Map<string,string>();
export function chineseSegments(text:string){
 return [...text.matchAll(/[\p{Script=Han}\d][\p{Script=Han}\d，。！？、；：…“”‘’（）％%·\s]*/gu)].map(m=>m[0].trim()).filter(hasChinese);
}
export function chineseSpeechText(text:string){return chineseSegments(text).join('。').replace(/。+/g,'。');}
export function readingFor(text:string,provided?:string){
 if(provided)return provided;
 if(!hasChinese(text))return '';
 const known=knownReading(text)||cache.get(text);if(known)return known;
 // Work on full phrases, never isolated characters from a sentence. Lexical tone
 // marks stay visible; actual 一/不 sandhi is heard in the spoken model.
 const result=chineseSegments(text).map(s=>knownReading(s)||pinyin(s,{toneSandhi:false,segmentit:2}).replace(/\s+([，。！？、；：…“”‘’（）])/g,'$1')).join(' · ');
 if(cache.size>=500)cache.clear();cache.set(text,result);return result;
}
