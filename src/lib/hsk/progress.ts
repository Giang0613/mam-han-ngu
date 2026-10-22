import {CONTENT_VERSION} from '../course';
import type {Snapshot} from '../study-types';
import {hskModules,hskExercises} from './catalog';
const known=new Set(hskExercises.map(e=>e.id));
export function hskProgress(data:Snapshot){
 const attempts=data.attempts.filter(a=>a.version===CONTENT_VERSION&&known.has(a.exercise_id));
 const answered=new Set(attempts.map(a=>a.exercise_id));
 const passed=new Set(attempts.filter(a=>a.correct&&!a.hint).map(a=>a.exercise_id));
 const current=hskModules.find(u=>u.id===hskExercises.find(e=>e.id===attempts.at(-1)?.exercise_id)?.lessonId)?.level||1;
 const next=hskModules.find(u=>u.level>=current&&u.exercises.length&&u.exercises.some(e=>!passed.has(e.id)))||hskModules.find(u=>u.level===current&&u.exercises.length)!;
 return {attempts,answered,passed,next};
}
