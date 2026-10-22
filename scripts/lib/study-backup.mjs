import fs from 'node:fs/promises';
import path from 'node:path';
import {randomBytes} from 'node:crypto';

export async function backupStudyDatabase(db, databasePath, directory) {
  const folder=path.resolve(directory||process.env.STUDY_BACKUP_DIR||path.join(path.dirname(databasePath),'.cache','backups'));
  await fs.mkdir(folder,{recursive:true,mode:0o700});
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  const filename=path.join(folder,'study-'+stamp+'-'+randomBytes(4).toString('hex')+'.db');
  // SQLite's online backup includes committed WAL data; a file copy does not.
  await db.backup(filename);
  await fs.chmod(filename,0o600);
  return filename;
}
