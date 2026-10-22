import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import Database from 'better-sqlite3';
import {createStudyProfile} from '../src/lib/server/legacy-profile';

const directory=fs.mkdtempSync(path.join(os.tmpdir(),'mam-han-ngu-legacy-'));
try{
 for(const mode of ['fresh','users','cards','both','invalid-card']){
  const filename=path.join(directory,mode+'.db');
  const db=new Database(filename);
  try{
   if(mode==='users'||mode==='both'){
    db.exec('CREATE TABLE users(id INTEGER PRIMARY KEY,name TEXT,xp INTEGER);');
    db.prepare('INSERT INTO users VALUES(1,?,?)').run('Legacy learner',42);
   }
   const hasCards=['cards','both','invalid-card'].includes(mode);
   if(hasCards){
    db.exec('CREATE TABLE flashcards(id INTEGER PRIMARY KEY,hanzi TEXT,pinyin TEXT,meaning TEXT,interval INTEGER,repetition INTEGER,ease_factor INTEGER,next_review_at INTEGER);');
    db.prepare('INSERT INTO flashcards VALUES(?,?,?,?,?,?,?,?)').run(7,'学','xué',mode==='invalid-card'?null:'learn',6,2,2500,1767225600);
   }
   const migration=spawnSync(process.execPath,['scripts/migrate-study.mjs'],{encoding:'utf8',env:{...process.env,STUDY_DATABASE_PATH:filename,STUDY_BACKUP_DIR:path.join(directory,'backups')}});
   assert.equal(migration.status,0,migration.stderr);
   const now='2026-10-22T00:00:00.000Z';
   if(mode==='invalid-card'){
    assert.throws(()=>createStudyProfile(db,'profile-a',now));
    assert.equal((db.prepare('SELECT COUNT(*) count FROM study_profiles').get() as {count:number}).count,0);
    assert.equal(db.prepare("SELECT value FROM study_meta WHERE key='legacy_adopted'").get(),undefined);
    assert.equal((db.prepare('SELECT COUNT(*) count FROM flashcards').get() as {count:number}).count,1);
    continue;
   }
   createStudyProfile(db,'profile-a',now);
   const profile=db.prepare('SELECT name,legacy_xp FROM study_profiles WHERE id=?').get('profile-a') as {name:string;legacy_xp:number};
   assert.equal(profile.legacy_xp,mode==='users'||mode==='both'?42:0);
   assert.equal(profile.name,mode==='users'||mode==='both'?'Legacy learner':'Học viên');
   const cards=db.prepare('SELECT id,ease,interval,repetition,due FROM study_cards WHERE profile_id=?').all('profile-a');
   assert.equal(cards.length,hasCards?1:0);
   if(hasCards)assert.deepEqual(cards[0],{id:'legacy-7',ease:2.5,interval:6,repetition:2,due:'2026-01-01T00:00:00.000Z'});
   createStudyProfile(db,'profile-b',now);
   assert.equal((db.prepare('SELECT legacy_xp FROM study_profiles WHERE id=?').get('profile-b') as {legacy_xp:number}).legacy_xp,0);
   assert.equal(db.prepare('SELECT 1 FROM study_cards WHERE profile_id=?').get('profile-b'),undefined);
   if(hasCards)assert.equal((db.prepare('SELECT ease_factor FROM flashcards WHERE id=7').get() as {ease_factor:number}).ease_factor,2500);
   if(mode==='users'||mode==='both')assert.equal((db.prepare('SELECT xp FROM users WHERE id=1').get() as {xp:number}).xp,42);
   assert.equal((db.prepare("SELECT value FROM study_meta WHERE key='legacy_adopted'").get() as {value:string}).value,'profile-a');
  }finally{db.close();}
 }
 console.log('PASS: fresh/partial/complete legacy databases, one-time adoption, 2500-to-2.5 conversion, unchanged source tables and atomic rollback on invalid legacy data.');
}finally{
 const resolved=path.resolve(directory);
 assert.ok(resolved.startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(resolved).startsWith('mam-han-ngu-legacy-'));
 fs.rmSync(resolved,{recursive:true,force:true});
}
