import assert from 'node:assert/strict';import {lessons,grammar,words,exercises,grade,searchKey,CONTENT_VERSION} from '../src/lib/course';import {allExercises,derive,localDay,progressPercent} from '../src/lib/study-engine';import {emptySnapshot,type Snapshot} from '../src/lib/study-types';import {calculateSM2} from '../src/lib/srs/sm2';import {displayPinyin} from '../src/lib/pinyin-format';
assert.equal(lessons.length,48);assert.equal(grammar.length,120);assert.equal(new Set(exercises.map(e=>e.id)).size,exercises.length);assert.equal(new Set(words.map(w=>w.id)).size,words.length);
for(const e of Object.values(allExercises)){assert.ok(e.prompt&&e.explanation&&e.concept,e.id);assert.ok(grade(e,e.answer),e.id);if(e.options)assert.equal(e.options.filter(o=>o.id===e.answer).length,1,e.id);if(e.tokens)assert.equal(e.tokens.join(''),e.answer,e.id)}
assert.equal(searchKey('lǚ yóu'),searchKey('lv3you2'));assert.notEqual(searchKey('lǜ'),searchKey('lù'));assert.equal(searchKey('nu:3'),searchKey('nǚ'));
assert.equal(displayPinyin('xue2 sheng5'),'xué sheng');assert.equal(displayPinyin('lu:3 you2'),'lǚ yóu');assert.equal(displayPinyin('ma5'),'ma');
const now=new Date('2026-10-06T12:00:00Z'),id=exercises[0].id,e=exercises[0];const a={event_id:'event',exercise_id:id,answer:e.answer,correct:1,hint:0,concept:e.concept,skill:e.skill,version:CONTENT_VERSION,created_at:now.toISOString()};const s:Snapshot={...emptySnapshot,profile:{...emptySnapshot.profile},attempts:[a,{...a,event_id:'event2'}],cards:[],reviewDays:[],bookmarks:[],placement:null};assert.equal(derive(s,now).xp,10);assert.equal(derive(s,now).todayCount,1);assert.equal(derive({...s,attempts:[{...a,hint:1}]},now).xp,0);assert.equal(derive({...s,attempts:[{...a,version:'old'}]},now).xp,0);assert.equal(localDay('2026-10-05T18:00:00Z'),'2026-10-06');
const bad={...a,correct:0},weak={...s,attempts:[bad,{...bad,event_id:'b2'}]};assert.equal(derive(weak,now).weaknesses.length,1);assert.equal(derive({...weak,attempts:[...weak.attempts,{...a,event_id:'fixed'}]},now).weaknesses.length,0);
for(const q of [0,1,2,3,4,5]){const next=calculateSM2({interval:0,repetition:0,easeFactor:2.5,dueDate:now},q,now);assert.ok(next.easeFactor>=1.3);assert.equal(next.repetition,q>=3?1:0);assert.ok(next.dueDate>now)}assert.throws(()=>calculateSM2({interval:0,repetition:0,easeFactor:2.5,dueDate:now},6,now));
// Empty or invalid denominators must never reach CSS or ARIA as NaN/Infinity.
for(const [completed,total,expected] of [
 [0,0,0],[2,0,0],[0,10,0],[1,3,33],[2,3,67],[10,10,100],
 [12,10,100],[-1,10,0],[1,-1,0],[NaN,10,0],[1,NaN,0],
 [Infinity,10,0],[1,Infinity,0],[-Infinity,10,0],[1,-Infinity,0],
] as const){assert.equal(progressPercent(completed,total),expected);}
const empty=derive(emptySnapshot,now);
assert.equal(empty.accuracy,null);assert.equal(empty.completedLessons.length,0);
assert.ok(empty.skills.every(skill=>skill.total===0&&progressPercent(skill.correct,skill.total)===0));
assert.equal(derive(s,now).accuracy,100);
assert.equal(derive({...s,attempts:[bad]},now).accuracy,0);
assert.equal(derive({...s,attempts:[{...a,hint:1}]},now).accuracy,0);
// A lesson without published questions is not a completed lesson.
const originalExercises=[...exercises];
try{
 exercises.splice(0,exercises.length,...exercises.filter(item=>item.lessonId!==lessons[0].id));
 assert.ok(!derive(emptySnapshot,now).completedLessons.includes(lessons[0].id));
}finally{exercises.splice(0,exercises.length,...originalExercises);}
console.log(JSON.stringify({lessons:lessons.length,grammar:grammar.length,words:words.length,exercises:exercises.length,allExerciseKinds:Object.keys(allExercises).length,checks:'content references,grading,ü search,duplicate XP,hints,versions,timezone,weakness recovery,empty and bounded progress,SM-2 passed'}));
