import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import {translate,hasEnglish} from './translate';
import type {Locale} from './types';
import {dictionaryEnglish} from '../dictionary-server';
import {uniqueEnglishGloss} from '../dictionary-english';
import vocabularyEnglish from './vocabulary.en.json';

let cached:Record<string,string>={},stamp=-1;
function privateCatalog(){
 const published=fs.existsSync(path.join(process.cwd(),'data/materials.en.json'));
 const file=path.join(process.cwd(),'data',published?'materials.en.json':'i18n-private.en.json');
 if(!fs.existsSync(file))return cached;
 const overrides=path.join(process.cwd(),'data',published?'materials-overrides.en.json':'i18n-private-overrides.en.json');
 const current=fs.statSync(file).mtimeMs+(fs.existsSync(overrides)?fs.statSync(overrides).mtimeMs:0);
 if(stamp!==current){cached={...JSON.parse(fs.readFileSync(file,'utf8')),...(fs.existsSync(overrides)?JSON.parse(fs.readFileSync(overrides,'utf8')):{})};stamp=current;}
 return cached;
}
const fields=new Set(['meaning','meaningEn','exampleMeaning','partOfSpeech','vi','title','description','prompt','explanation','goal','note','context','label','source','topicTitle','lessonTitle','error','message','hint','text','translation','instruction']);
const learnerFields=new Set(['profile','draft','answers','submissions','history','messages','input','output','notes']);
/** Localize display fields, never answer keys, IDs, pinyin, or learner text. */
export function localizeResource<T>(value:T,locale:Locale,key=''):T{
 if(locale==='vi')return value;
 const catalog:Record<string,string>={...vocabularyEnglish,...privateCatalog()};
 function visit(item:unknown,field:string):unknown{
  if(learnerFields.has(field))return item;
  if(typeof item==='string'){
   if(!fields.has(field))return item;
   const normalized=item.replace(/\s+/g,' ').trim();
   const text=hasEnglish(normalized)?translate(item,'en'):catalog[normalized]||translate(item,'en');
   return field==='meaning'||field==='meaningEn'?uniqueEnglishGloss(text):text;
  }
  if(Array.isArray(item))return item.map(child=>visit(child,field));
  if(item&&typeof item==='object'){
   const result=Object.fromEntries(Object.entries(item).map(([name,child])=>[name,visit(child,name)]));
   if('hanzi' in item&&typeof item.hanzi==='string'&&'pinyin' in item&&typeof item.pinyin==='string'&&'meaning' in item&&typeof item.meaning==='string'){
    const english=dictionaryEnglish(item as Parameters<typeof dictionaryEnglish>[0]);
    if(english){result.meaning=result.meaningEn=english.meaning;result.meaningSource=english.source;result.meaningStatus=english.status;result.dictionaryDetails=english.details;}
    else {result.meaningStatus='draft';result.meaningEn=result.meaning;}
   }
   if('lessonTitle' in item&&typeof item.lessonTitle==='string'&&'topicTitle' in item){
    const sequence=/·\s*(\d+)\s*$/.exec(item.lessonTitle)?.[1];
    if(sequence)result.lessonTitle=`${result.topicTitle} · ${sequence}`;
   }
   if('wordIds' in item&&Array.isArray(item.wordIds)&&'sequence' in item&&'topicTitle' in item){
    result.title=`${result.topicTitle} · ${String(result.sequence).padStart(2,'0')}`;
    result.goal=`Recognize and use ${item.wordIds.length} words about ${String(result.topicTitle).toLowerCase()}; listen to examples and check their meanings before reviewing.`;
   }
   if('translation' in item&&'vi' in item)result.translation='machine';
   return result;
  }
  return item;
 }
 return visit(value,key) as T;
}
