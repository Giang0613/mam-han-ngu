import Database from 'better-sqlite3';
import path from 'path';
import {mkdirSync} from 'node:fs';

// Store DB in the root directory
// The learner database is runtime storage, never a build-traced resource.
const databasePath=path.resolve(/* turbopackIgnore: true */ process.env.STUDY_DATABASE_PATH||path.join(process.cwd(),'local.db'));
mkdirSync(path.dirname(databasePath),{recursive:true});
export const sqlite = new Database(databasePath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('busy_timeout = 5000');
