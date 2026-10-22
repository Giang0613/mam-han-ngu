import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import Database from 'better-sqlite3';
import {hskExercises,hskTasks,HSK_REVISION} from '../src/lib/hsk/catalog';
import {CONTENT_VERSION} from '../src/lib/course';
const origin=process.env.STUDY_TEST_ORIGIN||'http://localhost:3000';
async function session(){const r=await fetch(origin+'/api/study');assert.equal(r.status,200);const raw=r.headers.get('set-cookie');assert.ok(raw);return {cookie:raw.split(';')[0]};}
async function post(s:{cookie:string},path:string,payload:unknown,requestOrigin=origin){const r=await fetch(origin+path,{method:'POST',headers:{Cookie:s.cookie,Origin:requestOrigin,'Content-Type':'application/json'},body:JSON.stringify(payload)});return {status:r.status,data:await r.json()};}
async function main(){
const a=await session(),b=await session(),ids=[a,b].map(s=>createHash('sha256').update(s.cookie.split('=')[1]).digest('hex'));
try{
 for(const s of [a,b])assert.equal((await post(s,'/api/study',{action:'settings',name:`SuperWeb HSK QA ${randomUUID()}`,goal:5,startLevel:1,pinyin:true,muted:false,rate:.8})).status,200);
 const choice=hskExercises.find(e=>e.kind==='choice')!,pairs=hskExercises.find(e=>e.kind==='matching')!,typing=hskExercises.find(e=>e.kind==='typing')!;
 const attempt=(e:typeof choice,answer:string,eventId=randomUUID())=>({action:'attempt',exerciseId:e.id,answer,eventId,hint:false,version:CONTENT_VERSION});
 const wrong=await post(a,'/api/study',attempt(choice,'a1'));assert.equal(wrong.status,200);assert.equal(wrong.data.result.correct,false);
 const payload=attempt(pairs,pairs.answer);const correct=await post(a,'/api/study',payload);assert.equal(correct.status,200);assert.equal(correct.data.result.correct,true);assert.equal((await post(a,'/api/study',payload)).data.snapshot.attempts.length,2);assert.equal((await post(a,'/api/study',{...payload,answer:'p0:p1|p1:p0|p2:p2'})).status,409);
 assert.equal((await post(a,'/api/study',attempt(typing,typing.answer+'。'))).data.result.correct,true);
 assert.equal((await post(a,'/api/study',attempt(choice,'a 0'))).data.result.correct,false);
 const taskId=hskTasks[0].id,draft={taskId,revision:HSK_REVISION,text:'我是越南人。我在学习中文。'};
 assert.equal((await post(a,'/api/hsk/draft',draft)).status,200);
 const get=(s:{cookie:string})=>fetch(origin+'/api/hsk/draft?taskId='+encodeURIComponent(taskId),{headers:{Cookie:s.cookie}}).then(r=>r.json());
 assert.equal((await get(a)).draft.text,draft.text);assert.equal((await get(b)).draft,null);
 assert.equal((await post(a,'/api/hsk/draft',{...draft,revision:'stale'})).status,400);assert.equal((await post(a,'/api/hsk/draft',{...draft,taskId:'unknown'})).status,404);assert.equal((await post(a,'/api/hsk/draft',draft,'https://unrelated.invalid')).status,403);
 const unauthorized=await fetch(origin+'/api/hsk/draft?taskId='+taskId);assert.equal(unauthorized.status,401);
 const reload=await (await fetch(origin+'/api/study',{headers:{Cookie:a.cookie}})).json();assert.equal(reload.attempts.length,4);
 assert.equal((await fetch(origin+'/hsk/10')).status,404);assert.equal((await fetch(origin+'/hsk/1/missing')).status,404);
 console.log('PASS: HSK wrong/correct answers, matching replay and conflicts, Hanzi accepted variant, strict IDs, reload, draft isolation, CSRF and invalid routes.');
}finally{const db=new Database('local.db');db.transaction(()=>{for(const id of ids){const p=db.prepare('SELECT name FROM study_profiles WHERE id=?').get(id) as {name:string}|undefined;if(!p?.name.startsWith('SuperWeb HSK QA '))throw Error('Refusing to remove non-QA data');for(const table of ['study_hsk_drafts','study_attempts','study_cards','study_review_events','study_bookmarks','study_placements','study_tutor','study_usage'])db.prepare(`DELETE FROM ${table} WHERE profile_id=?`).run(id);db.prepare('DELETE FROM study_profiles WHERE id=?').run(id);}})();db.close();}
}
void main().catch(error=>{console.error(error);process.exitCode=1;});
