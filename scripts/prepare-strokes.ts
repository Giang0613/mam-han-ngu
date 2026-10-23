import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pinyin} from 'pinyin-pro';
import {alignReading} from '../src/lib/reading-alignment';
import {writingReadings} from '../src/lib/writing-readings';
import type {VocabularyEntry} from '../src/lib/hsk/vocabulary-types';
import type {WritingCharacter} from '../src/lib/writing-types';
const source='node_modules/hanzi-writer-data',target='public/hanzi';
const raw=fs.readFileSync('data/hsk-vocabulary.json'),words=JSON.parse(raw.toString()) as VocabularyEntry[];
const byId=new Map(words.map(word=>[word.id,word]));
const characters=new Map<string,{levels:Set<number>;ids:Set<string>;readings:Map<string,number>}>();
for(const word of words){
 for(const character of new Set([...word.hanzi].filter(char=>/\p{Script=Han}/u.test(char)))){
  const entry=characters.get(character)||{levels:new Set<number>(),ids:new Set<string>(),readings:new Map<string,number>()};
  entry.levels.add(word.sourceLevel==='7-9'?79:Number(word.sourceLevel));entry.ids.add(word.id);characters.set(character,entry);
 }
 for(const unit of alignReading(word.hanzi,word.pinyin)||[]){
  const han=[...unit.text].filter(char=>/\p{Script=Han}/u.test(char)),readings=unit.reading?.split(/\s+/)||[];
  if(han.length!==readings.length)continue; // Do not split an erhua syllable into invented readings.
  han.forEach((char,index)=>{const entry=characters.get(char)!;const reading=readings[index].toLowerCase().normalize('NFC');entry.readings.set(reading,(entry.readings.get(reading)||0)+1);});
 }
}
fs.mkdirSync(target,{recursive:true});
const entries:WritingCharacter[]=[],missing:string[]=[];
for(const [character,item] of characters){
 const file=path.join(source,character+'.json');if(!fs.existsSync(file)){missing.push(character);continue;}
 const bytes=fs.readFileSync(file),strokeData=JSON.parse(bytes.toString());
 if(!strokeData.strokes?.length||strokeData.strokes.length!==strokeData.medians?.length)throw Error('Invalid stroke data: '+character);
 const allowed=new Set(pinyin(character,{multiple:true,type:'array',toneSandhi:false}));
 const observed=[...item.readings].filter(([reading])=>allowed.has(reading)).sort((a,b)=>b[1]-a[1]).map(([reading])=>reading);
 const primary=pinyin(character,{toneSandhi:false});
 const readings=writingReadings[character]||(character==='一'||character==='不'?[primary]:[...new Set([...(observed.includes(primary)||!observed.length?[primary]:[]),...observed])]);
 const wordIds=[...item.ids].sort((a,b)=>{const left=byId.get(a)!,right=byId.get(b)!;return left.level-right.level||[...left.hanzi].length-[...right.hanzi].length||left.sourceRow-right.sourceRow;}).slice(0,4);
 entries.push({character,readings,strokes:strokeData.strokes.length,levels:[...item.levels].sort((a,b)=>a-b),wordIds});
 const destination=path.join(target,character+'.json');
 if(!fs.existsSync(destination)||!bytes.equals(fs.readFileSync(destination)))fs.writeFileSync(destination,bytes);
}
if(missing.length)throw Error('Missing stroke files: '+missing.join(' '));
entries.sort((a,b)=>a.levels[0]-b.levels[0]||a.strokes-b.strokes||a.character.codePointAt(0)!-b.character.codePointAt(0)!);
fs.writeFileSync('data/writing-characters.json',JSON.stringify(entries)+'\n');
const metadata={source:'https://github.com/chanind/hanzi-writer-data',version:JSON.parse(fs.readFileSync(path.join(source,'package.json'),'utf8')).version,license:'Arphic Public License',characters:entries.length,missing,vocabularySource:'data/hsk-vocabulary-sources.json',vocabularySha256:createHash('sha256').update(raw).digest('hex'),levelMeaning:'Characters occurring in the supplied vocabulary bands; not an official character-level syllabus.',readings:'Observed word readings filtered by pinyin-pro, with authored common-reading overrides. Erhua is not split into invented syllables.'};
fs.copyFileSync(path.join(source,'ARPHICPL.TXT'),path.join(target,'LICENSE.txt'));
fs.writeFileSync(path.join(target,'SOURCE.json'),JSON.stringify(metadata,null,2)+'\n');
console.log(JSON.stringify({characters:entries.length,sourceVersion:metadata.version,missing:missing.length}));
