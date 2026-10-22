import {createHash, randomBytes} from 'node:crypto';
import type Database from 'better-sqlite3';
import {StudyError} from './study-error';

export const SESSION_SECONDS = 365 * 86400;
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

export function profileForSession(db: Database.Database, token?: string) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const digest = hash(token);
  const session = db.prepare('SELECT s.profile_id FROM study_sessions s JOIN study_profiles p ON p.id=s.profile_id WHERE s.token_hash=? AND s.expires_at>?').get(digest, new Date().toISOString()) as {profile_id: string} | undefined;
  if (session) return session.profile_id;
  // Existing installations used the session digest as the profile ID.
  return db.prepare('SELECT id FROM study_profiles WHERE id=?').get(digest) ? digest : null;
}

export function createRecoveryCode(db: Database.Database, profile: string) {
  const code = 'MHS-' + randomBytes(32).toString('hex');
  db.prepare('INSERT INTO study_recovery(profile_id,code_hash,created_at) VALUES(?,?,?) ON CONFLICT(profile_id) DO UPDATE SET code_hash=excluded.code_hash,created_at=excluded.created_at').run(profile, hash('recovery:' + code), new Date().toISOString());
  return code;
}

export function recoverProfile(db: Database.Database, raw: string) {
  const code = raw.trim();
  if (!/^MHS-[a-f0-9]{64}$/.test(code)) throw new StudyError(401, 'Mã khôi phục không hợp lệ hoặc đã được thay thế.');
  return db.transaction(() => {
    const row = db.prepare('SELECT r.profile_id FROM study_recovery r JOIN study_profiles p ON p.id=r.profile_id WHERE r.code_hash=?').get(hash('recovery:' + code)) as {profile_id: string} | undefined;
    if (!row) throw new StudyError(401, 'Mã khôi phục không hợp lệ hoặc đã được thay thế.');
    const secret = randomBytes(32).toString('hex');
    const now = new Date();
    db.prepare('DELETE FROM study_sessions WHERE expires_at<=?').run(now.toISOString());
    db.prepare('INSERT INTO study_sessions(token_hash,profile_id,created_at,expires_at) VALUES(?,?,?,?)').run(hash(secret), row.profile_id, now.toISOString(), new Date(now.getTime() + SESSION_SECONDS * 1000).toISOString());
    // A recovery code remains valid until explicitly replaced in Settings.
    // A lost response must not permanently consume the user's only credential.
    return secret;
  })();
}
