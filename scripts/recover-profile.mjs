import fs from 'node:fs';
import path from 'node:path';
import {randomBytes,createHash} from 'node:crypto';
import Database from 'better-sqlite3';
const filename=path.resolve(process.env.STUDY_DATABASE_PATH||'local.db');
if(!fs.existsSync(filename))throw Error('Study database not found.');
const listing=process.argv.includes('--list'),index=process.argv.indexOf('--profile');
if(!listing&&(index<0||!process.argv[index+1]))throw Error('Usage: node scripts/recover-profile.mjs --list OR --profile <profile-id>');
const db=new Database(filename,{readonly:listing,fileMustExist:true});
try{
 if(listing){
  // Owner-only local CLI. Never call this from a web endpoint.
  console.table(db.prepare('SELECT id,name,created_at FROM study_profiles ORDER BY created_at').all());
 }else{
  const id=process.argv[index+1];
  if(!/^[a-f0-9]{64}$/.test(id)||!db.prepare('SELECT 1 FROM study_profiles WHERE id=?').get(id))throw Error('Profile not found.');
  const code='MHS-'+randomBytes(32).toString('hex');
  db.prepare('INSERT INTO study_recovery(profile_id,code_hash,created_at) VALUES(?,?,?) ON CONFLICT(profile_id) DO UPDATE SET code_hash=excluded.code_hash,created_at=excluded.created_at').run(id,createHash('sha256').update('recovery:'+code).digest('hex'),new Date().toISOString());
  console.log('Private recovery code (replaces any earlier code):');
  console.log(code);
 }
}finally{db.close();}
