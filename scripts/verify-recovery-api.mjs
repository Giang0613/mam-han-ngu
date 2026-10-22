import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const origin=process.env.STUDY_TEST_ORIGIN||'http://localhost:3000';
async function session(){
 const r=await fetch(origin+'/api/study');
 assert.equal(r.status,200);
 return r.headers.get('set-cookie').split(';')[0];
}
async function post(api,payload,cookie,requestOrigin=origin){
 return fetch(origin+api,{method:'POST',headers:{'Content-Type':'application/json',Origin:requestOrigin,...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(payload)});
}
const original=await session(),other=await session(),name='QA recovery '+randomUUID();
assert.equal((await post('/api/study',{action:'settings',name,goal:10,startLevel:1,pinyin:true,muted:false,rate:.8},original)).status,200);
assert.equal((await post('/api/study',{action:'saveWord',wordId:'w001'},original)).status,200);
const api='/api/profile/recovery';
assert.equal((await post(api,{action:'create'})).status,401);
assert.equal((await post(api,{action:'create'},original,'https://unrelated.invalid')).status,403);
const issued=await post(api,{action:'create'},original);
assert.equal(issued.status,200);assert.match(issued.headers.get('cache-control'),/no-store/);
const code=(await issued.json()).code;assert.match(code,/^MHS-[a-f0-9]{64}$/);
const fresh=await session();
assert.notEqual((await (await fetch(origin+'/api/study',{headers:{Cookie:fresh}})).json()).profile.name,name);
const restored=await post(api,{action:'restore',code},other);
assert.equal(restored.status,200);
assert.match(restored.headers.get('set-cookie'),/HttpOnly/i);
const cookie=restored.headers.get('set-cookie').split(';')[0];
assert.notEqual(cookie,original);
const data=await (await fetch(origin+'/api/study',{headers:{Cookie:cookie}})).json();
assert.equal(data.profile.name,name);assert.ok(data.cards.some(card=>card.id==='w001'));
const independent=await (await fetch(origin+'/api/study',{headers:{Cookie:other}})).json();
assert.notEqual(independent.profile.name,name);
const replacement=await (await post(api,{action:'create'},cookie)).json();
assert.notEqual(replacement.code,code);
const rejected=await post(api,{action:'restore',code});
assert.equal(rejected.status,401);assert.equal(rejected.headers.get('set-cookie'),null);
assert.equal((await post(api,{action:'restore',code:replacement.code})).status,200);
assert.equal((await post(api,{action:'restore',code:replacement.code,profileId:'someone-else'})).status,400);
assert.equal((await post(api,{action:'restore',code:'MHS-'+'0'.repeat(64)})).status,401);
console.log('PASS: code issuance ownership/CSRF, private response, fresh-browser isolation, independent restored session, saved-card persistence, code replacement, invalid-code rejection and no client-selected profile.');
