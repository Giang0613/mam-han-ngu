import fs from 'node:fs';
import path from 'node:path';
import {words,searchKey} from './course';
import {displayPinyin} from './pinyin-format';
import {vocabularyCorpus} from './hsk/vocabulary-server';
import type {VocabularyEntry} from './hsk/vocabulary-types';
import {translate} from './i18n/translate';
import {createEnglishLookup} from './dictionary-english';
import type {DictionaryMeaning} from './dictionary-format';
export type DictionaryEntry={id:string;traditional?:string;hanzi:string;pinyin:string;pinyinSource?:string;meaning:string;language:'vi'|'en';source:string;meaningSource?:string;meaningStatus?:'dictionary'|'provided'|'draft';dictionaryDetails?:DictionaryMeaning}&Partial<Pick<VocabularyEntry,'aliases'|'level'|'topic'|'topicTitle'|'lessonId'|'lessonTitle'|'sourceLevel'|'sourceId'|'sourceRow'|'sourcePage'|'meaningEn'|'translationStatus'|'translationMethod'|'senses'|'allocationReason'>>;
let data:DictionaryEntry[]|null=null;
export function dictionary(){
 if(data)return data;
 const file=path.resolve('data/cedict.json');
 data=fs.existsSync(file)?(JSON.parse(fs.readFileSync(file,'utf8')) as DictionaryEntry[]).map(w=>({...w,pinyin:w.pinyinSource?displayPinyin(w.pinyinSource):w.pinyin})):[];
 return data;
}
let englishLookup:ReturnType<typeof createEnglishLookup>|undefined;
export function dictionaryEnglish(word:Pick<DictionaryEntry,'hanzi'|'pinyin'|'meaning'>&Partial<DictionaryEntry>){
 englishLookup??=createEnglishLookup(dictionary());return englishLookup(word);
}
export const courseDictionary:DictionaryEntry[]=words.map(w=>({id:w.id,hanzi:w.zh,pinyin:w.pinyin,meaning:w.vi,meaningEn:translate(w.vi,'en'),language:'vi',source:'Từ vựng khóa học Mầm Hán Ngữ'}));
export function dictionaryEntry(id:string){return courseDictionary.find(w=>w.id===id)||vocabularyCorpus().byId.get(id)||dictionary().find(w=>w.id===id);}
const normalized=new Map<string,{py:string;meaning:string}>();
let indexedCorpus:ReturnType<typeof vocabularyCorpus>|undefined;
const pinyinKey=(s:string)=>searchKey(s).replace(/[-’']/g,'');
const plain=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('đ','d');
export function dictionarySearch(q:string,page=0,limit=24,filters:{level?:number;topic?:string;scope?:string}={}){
 const key=pinyinKey(q),viKey=plain(q),v=vocabularyCorpus();
 if(indexedCorpus!==v){normalized.clear();indexedCorpus=v;}
 const match=(w:DictionaryEntry)=>{
  let index=normalized.get(w.id);
  if(!index){index={py:pinyinKey(w.pinyin),meaning:plain(w.meaning+' '+(dictionaryEnglish(w)?.meaning||w.meaningEn||''))};normalized.set(w.id,index);}
  return w.hanzi.includes(q)||w.traditional?.includes(q)||w.aliases?.some(s=>s.includes(q))||index.py.includes(key)||index.meaning.includes(viKey);
 };
 const scope=filters.scope||'all',level=filters.level;
 const levelWords=v.entries.filter(w=>!level||(level===79?w.sourceLevel==='7-9':w.level===level));
 const hsk=filters.topic?levelWords.filter(w=>w.topic===filters.topic):levelWords;
 const pool:DictionaryEntry[]=level||filters.topic||scope==='hsk'?hsk:scope==='course'?courseDictionary:scope==='cedict'?dictionary():[...courseDictionary,...hsk,...dictionary()];
 const results=q?pool.filter(match):pool;
 if(q){const rank=(w:DictionaryEntry)=>w.hanzi===q||w.traditional===q?10:pinyinKey(w.pinyin)===key?8:w.hanzi.startsWith(q)?6:2;
  results.sort((a,b)=>rank(b)-rank(a)||(a.language==='vi'?0:1)-(b.language==='vi'?0:1));}
 const topics=[...new Set(levelWords.map(w=>w.topic))].map(id=>({id,title:levelWords.find(w=>w.topic===id)!.topicTitle}));
 return {results:results.slice(page*limit,(page+1)*limit),total:results.length,corpus:dictionary().length,courseWords:courseDictionary.length,hskWords:v.entries.length,page,hasMore:(page+1)*limit<results.length,
  levelCounts:Array.from({length:9},(_,i)=>({level:i+1,count:v.entries.filter(w=>w.level===i+1).length})),topics,sources:v.sources};
}
