import fs from 'node:fs';
import path from 'node:path';
import {searchKey,type Exercise} from '../course';
import type {VocabularyEntry,VocabularyLesson,VocabularySource,LessonIndex} from './vocabulary-types';

let cacheStamp=0;
let exerciseCache=new Map<string,Exercise>();
let levelPools=new Map<number,VocabularyEntry[]>();
let topicPools=new Map<string,VocabularyEntry[]>();
let meaningTokens=new Map<string,Set<string>>();
const meaningStop=new Set('mot nhung nguoi su viec cac voi va de la duoc khong co rat noi ve trong khi cho cua nay do nhu tu the roi chiec cai con bi hay hoac chi tung nhieu'.split(' '));
function lexicalMeaning(w:VocabularyEntry){
 let tokens=meaningTokens.get(w.id);if(tokens)return tokens;
 const text=w.meaning.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('đ','d');
 tokens=new Set((text.match(/[a-z]+/g)||[]).filter(s=>s.length>=2&&!meaningStop.has(s)));meaningTokens.set(w.id,tokens);return tokens;
}
function meaningsOverlap(a:VocabularyEntry,b:VocabularyEntry){const left=lexicalMeaning(a),right=lexicalMeaning(b);return [...left].some(token=>right.has(token));}
let cache:{entries:VocabularyEntry[];lessons:VocabularyLesson[];sources:VocabularySource[];byId:Map<string,VocabularyEntry>;byLesson:Map<string,VocabularyLesson>}|undefined;
export function vocabularyCorpus(){
 const stamp=fs.statSync(path.resolve('data/hsk-vocabulary.json')).mtimeMs;
 if(cache&&stamp===cacheStamp)return cache;
 const read=<T,>(file:string)=>JSON.parse(fs.readFileSync(path.resolve('data',file),'utf8')) as T;
 const entries=read<VocabularyEntry[]>('hsk-vocabulary.json'),lessons=read<VocabularyLesson[]>('hsk-vocabulary-lessons.json'),sources=read<VocabularySource[]>('hsk-vocabulary-sources.json');
 cache={entries,lessons,sources,byId:new Map(entries.map(w=>[w.id,w])),byLesson:new Map(lessons.map(l=>[l.id,l]))};
 cacheStamp=stamp;
 exerciseCache=new Map();levelPools=new Map();topicPools=new Map();meaningTokens=new Map();
 for(const w of entries){
  const level=levelPools.get(w.level)||[];level.push(w);levelPools.set(w.level,level);
  const key=`${w.level}:${w.topic}`,topic=topicPools.get(key)||[];topic.push(w);topicPools.set(key,topic);
 }
 return cache;
}
export function vocabularyMatches(w:VocabularyEntry,q:string){
 const key=searchKey(q),plain=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('đ','d');
 return w.hanzi.includes(q)||w.aliases?.some(s=>s.includes(q))||searchKey(w.pinyin).includes(key)||plain(w.meaning).includes(plain(q))||w.meaningEn?.toLowerCase().includes(q.toLowerCase());
}
export function vocabularyLessons(level:number,topic='',q='',page=0):LessonIndex{
 const all=vocabularyCorpus().lessons.filter(l=>l.level===level);
 const topics=[...new Set(all.map(l=>l.topic))].map(id=>({id,title:all.find(l=>l.topic===id)!.topicTitle,count:all.filter(l=>l.topic===id).length}));
 const filtered=all.filter(l=>(!topic||l.topic===topic)&&(!q||l.wordIds.some(id=>vocabularyMatches(vocabularyCorpus().byId.get(id)!,q))));
 return {results:filtered.slice(page*24,page*24+24),total:filtered.length,page,hasMore:page*24+24<filtered.length,topics,words:all.reduce((n,l)=>n+l.wordIds.length,0)};
}
export function vocabularyLesson(id:string){return vocabularyCorpus().byLesson.get(id);}
export function vocabularyWords(lesson:VocabularyLesson){return lesson.wordIds.map(id=>vocabularyCorpus().byId.get(id)!);}

// Deterministic answer keys stay on the server. Prefix v1 fixes the imported vocabulary revision.
export function vocabularyExercise(id:string):Exercise|undefined{
 const match=/^hskv1-(hskpdf-(?:[1-6]|79)-\d{4})-([mr])$/.exec(id);
 if(!match)return;
 const c=vocabularyCorpus(),cached=exerciseCache.get(id);if(cached)return cached;
 const w=c.byId.get(match[1]);if(!w)return;
 const lesson=c.byLesson.get(w.lessonId)!;
 const pool=[...vocabularyWords(lesson),...(topicPools.get(`${w.level}:${w.topic}`)||[])];
 const choices=[w], meanings=new Set([w.meaning]),hanzi=new Set([w.hanzi]);
 const offset=w.sourceRow%Math.max(1,pool.length);
 for(let i=0;i<pool.length&&choices.length<4;i++){
  const x=pool[(offset+i)%pool.length];
  if(hanzi.has(x.hanzi)||meanings.has(x.meaning)||choices.some(c=>meaningsOverlap(c,x)))continue;
  choices.push(x);meanings.add(x.meaning);hanzi.add(x.hanzi);
 }
 for(const x of levelPools.get(w.level)||[]){
  if(choices.length===4)break;
  if(hanzi.has(x.hanzi)||meanings.has(x.meaning)||choices.some(c=>meaningsOverlap(c,x)))continue;
  choices.push(x);meanings.add(x.meaning);hanzi.add(x.hanzi);
 }
 if(choices.length<2)return;
 const meaning=match[2]==='m';
 const exercise:Exercise={id,lessonId:w.lessonId,kind:'choice',skill:'vocabulary',concept:w.id,
  prompt:meaning?'Chọn nghĩa tiếng Việt của từ này.':`Chọn từ có nghĩa: ${w.meaning}`,
  ...(meaning?{zh:w.hanzi,pinyin:w.pinyin}:{}),
  options:choices.map(x=>({id:x.id,text:meaning?x.meaning:x.hanzi,...(!meaning?{pinyin:x.pinyin}:{})})),answer:w.id,answerPolicy:'option-id',
  explanation:`${w.hanzi} (${w.pinyin}): ${w.meaning}. ${w.translationStatus==='draft'?'Nghĩa dịch tự động, cần đối chiếu theo ngữ cảnh.':''}`};
 exerciseCache.set(id,exercise);return exercise;
}
export function vocabularyLessonExercises(lesson:VocabularyLesson){return lesson.wordIds.flatMap(id=>['m','r'].map(kind=>vocabularyExercise(`hskv1-${id}-${kind}`)!));}
