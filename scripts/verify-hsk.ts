import assert from 'node:assert/strict';
import {grade,CONTENT_VERSION} from '../src/lib/course';
import {hskLevels,hskModules,hskExercises,hskTasks,HSK_REVISION,hskLevelModules} from '../src/lib/hsk/catalog';
import {hskGrammar} from '../src/lib/hsk/grammar';
import {allExercises} from '../src/lib/study-engine';
import {hskProgress} from '../src/lib/hsk/progress';
import {emptySnapshot} from '../src/lib/study-types';
import {shuffled} from '../src/lib/exercise-shuffle';
assert.deepEqual(hskLevels.map(l=>l.level),[1,2,3,4,5,6,7,8,9]);
assert.equal(new Set([...hskModules,...hskExercises,...hskTasks].map(e=>e.id)).size,hskModules.length+hskExercises.length+hskTasks.length);
for(const l of hskLevels){const units=hskLevelModules(l.level);assert.ok(units.length>=7);assert.equal(hskGrammar.filter(g=>g.level===l.level).length,6);assert.ok(units.some(u=>u.skill==='Nghe'));assert.ok(units.some(u=>u.skill==='Đọc'));assert.ok(units.some(u=>u.skill==='Viết'));assert.ok(units.some(u=>u.skill==='Nói'));if(l.level>=7)assert.ok(units.some(u=>u.skill==='Dịch'));for(const u of units){assert.ok(u.goal&&u.method.length&&u.mistakes.length);assert.ok(u.tasks.length+u.exercises.length);}}
for(const e of hskExercises){assert.equal(allExercises[e.id],e);assert.ok(e.answer.length<=800,e.id);assert.ok(grade(e,e.answer));assert.ok(!grade(e,'definitely-wrong'));if(e.options){assert.equal(new Set(e.options.map(o=>o.id)).size,e.options.length);assert.equal(e.options.filter(o=>o.id===e.answer).length,1);assert.ok(!grade(e,'a 0'));}if(e.pairs){assert.equal(e.pairs.length,3);assert.ok(!grade(e,'p0:p1|p1:p0|p2:p2'));}if(e.tokens)assert.equal(e.tokens.join(''),e.answer);}
const written=hskExercises.find(e=>e.kind==='typing')!;assert.ok(grade(written,written.answer.normalize('NFD')+'。'));assert.ok(!grade(written,'公交车错'));
const slots=new Set(hskExercises.filter(e=>e.options?.length).map(e=>{const shuffledOptions=shuffled(e.options!,e.id+'-options');assert.deepEqual(shuffledOptions,shuffled(e.options!,e.id+'-options'));return shuffledOptions.findIndex(o=>o.id===e.answer)}));assert.ok(slots.size>=3,'Correct answer must vary across displayed positions');
const duplicateTiles=shuffled([{id:0,text:'我'},{id:1,text:'我'},{id:2,text:'的'}],'repeated-tiles');assert.equal(new Set(duplicateTiles.map(t=>t.id)).size,3);
const first=hskExercises[0],attempt={event_id:'hsk-test',exercise_id:first.id,answer:first.answer,correct:1,hint:0,concept:first.concept,skill:first.skill,version:CONTENT_VERSION,created_at:'2026-10-06T12:00:00Z'};
const progress=hskProgress({...emptySnapshot,attempts:[attempt,{...attempt,event_id:'hsk-retry'}]});assert.equal(progress.answered.size,1);assert.equal(progress.passed.size,1);assert.equal(hskProgress({...emptySnapshot,attempts:[{...attempt,hint:1}]}).passed.size,0);
for(const t of hskTasks){assert.ok(t.prompt&&t.model&&t.checklist.length);assert.ok(t.minimum>=0);}
console.log(JSON.stringify({revision:HSK_REVISION,levels:hskLevels.length,modules:hskModules.length,grammar:hskGrammar.length,autoExercises:hskExercises.length,openTasks:hskTasks.length,checks:'level coverage, stable IDs, exact ID/pair grading, Hanzi variants, hints and duplicate progress passed'}));
