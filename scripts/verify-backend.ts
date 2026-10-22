import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {randomBytes,createHash} from 'node:crypto';
import Database from 'better-sqlite3';
import {profileForSession,createRecoveryCode,recoverProfile} from '../src/lib/server/profile-access';
import {reserveServiceUsage,checkOrigin} from '../src/lib/server/study-guards';

const directory=fs.mkdtempSync(path.join(os.tmpdir(),'mam-han-ngu-backend-'));
const filename=path.join(directory,'test.db'),backups=path.join(directory,'backups');
const keys=['APP_ORIGIN','TRUST_PROXY','AI_INSTANCE_DAILY_LIMIT','AI_IP_DAILY_LIMIT'] as const;
const oldEnv=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
function migration(){
 const run=spawnSync(process.execPath,['scripts/migrate-study.mjs'],{encoding:'utf8',env:{...process.env,STUDY_DATABASE_PATH:filename,STUDY_BACKUP_DIR:backups}});
 assert.equal(run.status,0,run.stderr);
}
function denied(operation:()=>unknown,status=429){assert.throws(operation,(error:unknown)=>typeof error==='object'&&error!==null&&'status' in error&&error.status===status);}
migration();
const db=new Database(filename);
try{
 const token=randomBytes(32).toString('hex'),id=createHash('sha256').update(token).digest('hex');
 db.prepare('INSERT INTO study_profiles(id,name,created_at) VALUES(?,?,?)').run(id,'Recovery QA',new Date().toISOString());
 assert.equal(profileForSession(db,token),id);
 assert.equal(profileForSession(db,randomBytes(32).toString('hex')),null);
 const code=createRecoveryCode(db,id),restored=recoverProfile(db,code);
 assert.notEqual(restored,token);
 assert.equal(profileForSession(db,restored),id);
 const stored=db.prepare('SELECT code_hash FROM study_recovery WHERE profile_id=?').get(id) as {code_hash:string};
 assert.notEqual(stored.code_hash,code);
 const replacement=createRecoveryCode(db,id);
 denied(()=>recoverProfile(db,code),401);
 assert.equal(profileForSession(db,recoverProfile(db,replacement)),id);
 db.prepare("UPDATE study_sessions SET expires_at='2000-01-01T00:00:00.000Z'").run();
 assert.equal(profileForSession(db,restored),null);
 assert.equal(profileForSession(db,token),id,'Legacy session remains usable');
 const owner=spawnSync(process.execPath,['scripts/recover-profile.mjs','--profile',id],{encoding:'utf8',env:{...process.env,STUDY_DATABASE_PATH:filename}});
 assert.equal(owner.status,0,owner.stderr);
 const ownerCode=/MHS-[a-f0-9]{64}/.exec(owner.stdout)?.[0];assert.ok(ownerCode);
 assert.equal(profileForSession(db,recoverProfile(db,ownerCode)),id,'Local database owner can explicitly recover an orphaned profile');
 process.env.AI_INSTANCE_DAILY_LIMIT='2';process.env.AI_IP_DAILY_LIMIT='10';delete process.env.TRUST_PROXY;
 reserveServiceUsage(db,id,'tutor',30);
 reserveServiceUsage(db,'new-profile','tutor',30);
 denied(()=>reserveServiceUsage(db,'reset-cookie','tutor',30));
 assert.equal((db.prepare("SELECT count FROM study_usage_limits WHERE scope='instance' AND kind='tutor'").get() as {count:number}).count,2);
 assert.equal(db.prepare('SELECT count FROM study_usage WHERE profile_id=?').get('reset-cookie'),undefined);
 db.exec('DELETE FROM study_usage;DELETE FROM study_usage_limits;');
 process.env.AI_INSTANCE_DAILY_LIMIT='10';
 reserveServiceUsage(db,id,'tutor',1);
 denied(()=>reserveServiceUsage(db,id,'tutor',1));
 assert.equal((db.prepare("SELECT count FROM study_usage_limits WHERE scope='instance'").get() as {count:number}).count,1,'Rejected profile reservation rolls back instance/IP counters');
 db.exec('DELETE FROM study_usage;DELETE FROM study_usage_limits;');
 process.env.TRUST_PROXY='1';process.env.AI_IP_DAILY_LIMIT='1';
 const request=(address:string)=>new Request('http://internal/api',{headers:{'x-forwarded-for':address}});
 reserveServiceUsage(db,id,'tutor',30,request('203.0.113.10'));
 denied(()=>reserveServiceUsage(db,'another-profile','tutor',30,request('203.0.113.10')));
 reserveServiceUsage(db,'another-profile','tutor',30,request('203.0.113.11'));
 denied(()=>reserveServiceUsage(db,id,'tutor',30,request('203.0.113.10, 203.0.113.11')),503);
 process.env.APP_ORIGIN='https://learn.example';
 checkOrigin(new Request('http://internal/api',{headers:{origin:'https://learn.example',host:'internal'}}));
 denied(()=>checkOrigin(new Request('http://internal/api',{headers:{origin:'https://evil.example','x-forwarded-host':'evil.example','x-forwarded-proto':'https'}})),403);
 delete process.env.APP_ORIGIN;
 denied(()=>checkOrigin(new Request('http://localhost/api',{headers:{origin:'https://evil.example','x-forwarded-host':'evil.example','x-forwarded-proto':'https'}})),403);
 const plan=db.prepare('EXPLAIN QUERY PLAN SELECT id FROM study_cards WHERE profile_id=? ORDER BY due').all(id) as {detail:string}[];
 assert.ok(plan.some(row=>row.detail.includes('idx_study_cards_due')));
 db.pragma('journal_mode=WAL');
 db.prepare('UPDATE study_profiles SET name=? WHERE id=?').run('WAL backup QA',id);
 migration();
 const files=fs.readdirSync(backups);assert.ok(files.length>0);
 const backup=new Database(path.join(backups,files[0]),{readonly:true});
 try{
  assert.equal((backup.prepare('SELECT name FROM study_profiles WHERE id=?').get(id) as {name:string}).name,'WAL backup QA');
  assert.equal(backup.pragma('integrity_check',{simple:true}),'ok');
 }finally{backup.close();}
 assert.equal((db.prepare('SELECT name FROM study_profiles WHERE id=?').get(id) as {name:string}).name,'WAL backup QA');
 console.log('PASS: legacy identity, hashed recovery, rotation, session expiry, cookie-reset budget cap, atomic rollback, trusted proxy/IP policy, query index and consistent pre-migration WAL backup.');
}finally{
 db.close();
 for(const key of keys){if(oldEnv[key]===undefined)delete process.env[key];else process.env[key]=oldEnv[key];}
 const resolved=path.resolve(directory);
 assert.ok(resolved.startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(resolved).startsWith('mam-han-ngu-backend-'));
 fs.rmSync(resolved,{recursive:true,force:true});
}
