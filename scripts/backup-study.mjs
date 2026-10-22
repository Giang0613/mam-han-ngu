import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import {backupStudyDatabase} from './lib/study-backup.mjs';

const filename=path.resolve(process.env.STUDY_DATABASE_PATH||'local.db');
if(!fs.existsSync(filename))throw Error('No study database to back up.');
const db=new Database(filename,{readonly:true,fileMustExist:true});
try { await backupStudyDatabase(db,filename);console.log('Study backup completed in the configured private backup directory.'); }
finally { db.close(); }
