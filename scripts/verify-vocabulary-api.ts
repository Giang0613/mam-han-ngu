import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import Database from 'better-sqlite3';
import {vocabularyCorpus,vocabularyExercise} from '../src/lib/hsk/vocabulary-server';
import {CONTENT_VERSION} from '../src/lib/course';
import {derive} from '../src/lib/study-engine';
import type {Snapshot} from '../src/lib/study-types';
const origin=process.env.STUDY_TEST_ORIGIN||'http://localhost:3000';
const sessions:{cookie:string;id:string}[]=[];
async function session(){
 const r=await fetch(origin+'/api/study');assert.equal(r.status,200);const cookie=r.headers.get('set-cookie')!.split(';')[0];
 const s={cookie,id:createHash('sha256').update(cookie.split('=')[1]).digest('hex')};sessions.push(s);
 const mark=await post(s,{action:'settings',name:`SuperWeb vocabulary QA ${randomUUID()}`,goal:5,startLevel:1,pinyin:true,muted:false,rate:.8});assert.equal(mark.status,200);return s;
}
async function post(s:{cookie:string},data:unknown,requestOrigin=origin){const r=await fetch(origin+'/api/study',{method:'POST',headers:{Cookie:s.cookie,Origin:requestOrigin,'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:r.status,data:await r.json()};}
async function snapshot(s:{cookie:string},locale='vi'):Promise<Snapshot>{const r=await fetch(origin+'/api/study',{headers:{Cookie:s.cookie+'; mam_locale='+locale}});assert.equal(r.status,200);return r.json();}
async function main(){
 try{
 const {entries,lessons}=vocabularyCorpus();assert.equal(entries.length,11715);
 for(let level=1;level<=9;level++){
  const r=await fetch(`${origin}/api/dictionary?scope=hsk&level=${level}`),d=await r.json();assert.equal(r.status,200);assert.equal(d.total,entries.filter(w=>w.level===level).length);assert.ok(d.results.every((w:{level:number;pinyin:string;meaning:string})=>w.level===level&&w.pinyin&&w.meaning));
  const index=await (await fetch(`${origin}/api/hsk/vocabulary?level=${level}`)).json();assert.equal(index.total,lessons.filter(l=>l.level===level).length);
 }
 const band=await (await fetch(origin+'/api/dictionary?scope=hsk&level=79')).json();assert.equal(band.total,5600);
 const last=await (await fetch(origin+'/api/dictionary?scope=hsk&level=79&page=233')).json();assert.equal(last.results.length,8);assert.equal(last.hasMore,false);
 const a=await session(),b=await session(),word=entries.find(w=>w.sourceLevel==='7-9'&&w.hanzi==='挨'&&w.pinyin==='ái')!;
 assert.ok(word);const save={action:'saveWord',wordId:word.id};assert.equal((await post(a,save)).status,200);assert.equal((await post(a,save)).data.snapshot.cards.length,1);
 let s=await snapshot(a);assert.equal(s.cards[0].pinyin,word.pinyin);assert.equal(s.cards[0].meaning,word.meaning);assert.equal((await snapshot(b)).cards.length,0);
 const english=await snapshot(a,'en');assert.equal(english.cards[0].id,word.id);assert.equal(english.cards[0].pinyin,word.pinyin);assert.match(english.cards[0].meaning,/to suffer|to endure/);
 const e=vocabularyExercise(`hskv1-${word.id}-m`)!,reverse=vocabularyExercise(`hskv1-${word.id}-r`)!;
 const attempt=(exerciseId:string,answer:string,hint=false)=>({action:'attempt',exerciseId,answer,hint,eventId:randomUUID(),version:CONTENT_VERSION});
 const wrong=await post(a,attempt(e.id,e.options!.find(o=>o.id!==e.answer)!.id));assert.equal(wrong.status,200);assert.equal(wrong.data.result.correct,false);
 const good=attempt(e.id,e.answer),correct=await post(a,good);assert.equal(correct.status,200);assert.equal(correct.data.result.correct,true);assert.equal(derive(correct.data.snapshot).xp,10);
 assert.equal((await post(a,good)).data.snapshot.attempts.length,2);assert.equal((await post(a,{...good,answer:'other'})).status,409);
 assert.equal((await post(a,attempt(reverse.id,reverse.answer,true))).data.result.correct,true);assert.equal(derive(await snapshot(a)).xp,10);
 assert.equal((await post(a,attempt(reverse.id,` ${reverse.answer} `))).data.result.correct,false);
 assert.equal((await post(a,attempt('hskv1-hskpdf-79-5601-m','unknown'))).status,404);
 assert.equal((await post(a,save,'https://unrelated.invalid')).status,403);
 const rating={action:'review',eventId:randomUUID(),cardId:word.id,rating:4,revision:0};assert.equal((await post(a,rating)).status,200);assert.equal((await post(a,rating)).data.result.revision,1);
 assert.equal((await post(b,rating)).status,404);assert.equal((await snapshot(b)).attempts.length,0);
 assert.equal((await snapshot(a)).attempts.length,4);assert.equal((await snapshot(a)).cards[0].revision,1);
 for(const url of ['/api/dictionary?level=10','/api/hsk/vocabulary?level=10'])assert.equal((await fetch(origin+url)).status,400);
 for(const url of ['/hsk/10/vocabulary','/hsk/1/vocabulary/missing',`/hsk/2/vocabulary/${lessons.find(l=>l.level===1)!.id}`])assert.equal((await fetch(origin+url)).status,404);
 console.log('PASS: all 9 dictionary/lesson levels, full 7–9 pagination, imported card save/SM-2, server answer grading, replay/conflict, hinted XP, reload, profile isolation, CSRF and invalid routes.');
 }finally{
  const db=new Database('local.db');try{db.transaction(()=>{for(const s of sessions){const p=db.prepare('SELECT name FROM study_profiles WHERE id=?').get(s.id) as {name:string}|undefined;if(!p?.name.startsWith('SuperWeb vocabulary QA '))throw Error('Refusing to remove non-QA data');for(const table of ['study_hsk_drafts','study_attempts','study_cards','study_review_events','study_bookmarks','study_placements','study_tutor','study_usage'])db.prepare(`DELETE FROM ${table} WHERE profile_id=?`).run(s.id);db.prepare('DELETE FROM study_profiles WHERE id=?').run(s.id);}})();}finally{db.close();}
 }
}
void main().catch(e=>{console.error(e);process.exitCode=1;});
