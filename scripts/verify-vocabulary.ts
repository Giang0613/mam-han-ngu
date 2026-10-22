import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {vocabularyCorpus,vocabularyExercise,vocabularyLessonExercises,vocabularyLessons} from '../src/lib/hsk/vocabulary-server';
import {dictionarySearch} from '../src/lib/dictionary-server';
import {grade} from '../src/lib/course';
import {validVocabularyExerciseId} from '../src/lib/hsk/vocabulary-attempts';
const {entries,lessons,sources}=vocabularyCorpus();
assert.equal(entries.length,11715);assert.equal(new Set(entries.map(w=>w.id)).size,entries.length);
assert.deepEqual(sources.map(s=>s.rows),[499,772,973,1000,1071,1800,5600]);
assert.equal(new Set(lessons.flatMap(l=>l.wordIds)).size,entries.length);
assert.equal(lessons.reduce((n,l)=>n+l.wordIds.length,0),entries.length);
assert.ok(entries.every(w=>w.meaning.trim()&&w.pinyin.trim()&&w.sourcePage&&w.sourceRow&&w.language==='vi'));
const counts=[499,772,973,1000,1071,1800];
for(let level=1;level<=9;level++){
 const words=entries.filter(w=>w.level===level),levelLessons=lessons.filter(l=>l.level===level);
 assert.ok(words.length&&levelLessons.length);if(level<=6)assert.equal(words.length,counts[level-1]);
 assert.equal(dictionarySearch('',0,24,{scope:'hsk',level}).total,words.length);
 assert.equal(vocabularyLessons(level).words,words.length);
 for(const [i,l] of levelLessons.entries()){
  assert.equal(l.sequence,i+1);assert.equal(l.prerequisite,i?levelLessons[i-1].id:undefined);
  assert.ok(l.wordIds.length>0&&l.wordIds.length<=16);assert.equal(l.preview.length,l.previewPinyin?.length);
  for(const id of l.wordIds){const w=entries.find(w=>w.id===id)!;assert.equal(w.level,l.level);assert.equal(w.topic,l.topic);assert.equal(w.lessonId,l.id);}
  const exercises=vocabularyLessonExercises(l);assert.equal(exercises.length,l.wordIds.length*2);
  for(const e of exercises){
   assert.ok(validVocabularyExerciseId(e.id));assert.equal(vocabularyExercise(e.id)?.answer,e.answer);
   assert.equal(e.options?.length,4);assert.equal(new Set(e.options?.map(o=>o.id)).size,4);assert.equal(new Set(e.options?.map(o=>o.text)).size,4);
   assert.ok(grade(e,e.answer));assert.ok(!grade(e,e.options!.find(o=>o.id!==e.answer)!.id));assert.ok(!grade(e,` ${e.answer} `));
   if(e.id.endsWith('-r'))assert.ok(e.options!.every(o=>o.pinyin));else assert.ok(e.zh&&e.pinyin);
  }
 }
}
assert.equal(dictionarySearch('',0,24,{scope:'hsk',level:79}).total,5600);
const cup=entries.find(w=>w.level===1&&w.hanzi==='杯')!,cupOptions=vocabularyExercise(`hskv1-${cup.id}-m`)!.options!;
assert.ok(cupOptions.every(o=>o.id===cup.id||!/(?:^|[;, ])(?:Ly|ly|cốc|tách)(?:[;, ]|$)/u.test(o.text)),'Near-synonyms must not be marked wrong as distractors for 杯');
const sameHan=entries.filter(w=>w.sourceLevel==='7-9'&&w.hanzi==='挨');assert.equal(sameHan.length,2);assert.notEqual(sameHan[0].meaning,sameHan[1].meaning);assert.notEqual(sameHan[0].pinyin,sameHan[1].pinyin);
assert.ok(dictionarySearch('lv4zhou1',0,24,{scope:'hsk'}).results.some(w=>w.hanzi==='绿洲'));
assert.ok(dictionarySearch('lu4',0,24,{scope:'hsk'}).results.every(w=>w.hanzi!=='绿洲'));
assert.ok(dictionarySearch('hoa nhai',0,24,{scope:'hsk'}).results.some(w=>w.hanzi==='茉莉'));
assert.ok(dictionarySearch('jasmine',0,24,{scope:'hsk'}).results.some(w=>w.hanzi==='茉莉'));
const topic=dictionarySearch('',0,24,{scope:'hsk',level:1,topic:'food'});assert.ok(topic.results.every(w=>w.topic==='food'));assert.ok(topic.topics.length>1);
assert.ok(!vocabularyExercise('hskv1-hskpdf-79-5601-m'));assert.ok(!validVocabularyExerciseId('hskv1-hskpdf-1-0500-m'));
const summary=JSON.parse(readFileSync('src/lib/hsk/vocabulary-summary.json','utf8'));assert.equal(summary.total,entries.length);assert.equal(summary.lessons,lessons.length);
console.log(`PASS: ${entries.length} source records, all 9 levels, ${lessons.length} related lessons, ${entries.length*2} graded questions, contextual pinyin, different readings, source references and Vietnamese/pinyin/English search.`);
