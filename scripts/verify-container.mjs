import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
const suffix=randomUUID().slice(0,8),container='mam-han-ngu-ci-'+suffix,volume=container+'-data';
const origin='http://127.0.0.1:3003';
function docker(args,allowFailure=false){
 const result=spawnSync('docker',args,{encoding:'utf8'});
 if(!allowFailure)assert.equal(result.status,0,result.stderr);
 return result.stdout.trim();
}
async function ready(){
 for(let i=0;i<90;i++){
  try{const r=await fetch(origin,{signal:AbortSignal.timeout(1000)});if(r.ok)return;}catch{}
  await new Promise(resolve=>setTimeout(resolve,1000));
 }
 throw Error('Container did not become ready.');
}
async function post(url,payload,cookie){
 return fetch(origin+url,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(payload)});
}
try{
 docker(['run','--rm','--entrypoint','/opt/mandarin/bin/python','mandarin-sprout:ci','-c','import edge_tts,numpy,soundfile,pypinyin,pypinyin_dict; print("Voice imports ready")']);
 docker(['run','--detach','--name',container,'--publish','127.0.0.1:3003:3000','--mount','type=volume,src='+volume+',dst=/app/storage','--env','APP_ORIGIN='+origin,'mandarin-sprout:ci']);
 await ready();
 const first=await fetch(origin+'/api/study');assert.equal(first.status,200);
 const cookie=first.headers.get('set-cookie').split(';')[0],name='Container QA '+suffix;
 assert.equal((await post('/api/study',{action:'settings',name,goal:10,startLevel:1,pinyin:true,muted:false,rate:.8},cookie)).status,200);
 const response=await post('/api/profile/recovery',{action:'create'},cookie);assert.equal(response.status,200);
 const code=(await response.json()).code;
 docker(['restart',container]);
 await ready();
 const state=await (await fetch(origin+'/api/study',{headers:{Cookie:cookie}})).json();assert.equal(state.profile.name,name);
 const restored=await post('/api/profile/recovery',{action:'restore',code});assert.equal(restored.status,200);
 const recoveredCookie=restored.headers.get('set-cookie').split(';')[0];
 assert.equal((await (await fetch(origin+'/api/study',{headers:{Cookie:recoveredCookie}})).json()).profile.name,name);
 const count=Number(docker(['exec',container,'node','--input-type=module','-e',"import fs from 'node:fs';console.log(fs.readdirSync('/app/storage/backups').filter(x=>x.endsWith('.db')).length)"]));
 assert.ok(count>=1);
 console.log('PASS: Node/Python container, native SQLite, non-root persistent volume, profile survives restart, recovery works, and pre-migration backup exists.');
}catch(error){
 const logs=docker(['logs','--tail','60',container],true);
 console.error(logs);throw error;
}finally{
 docker(['rm','--force',container],true);
 docker(['volume','rm',volume],true);
}
