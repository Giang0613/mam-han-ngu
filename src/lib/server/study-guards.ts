import {createHash} from 'node:crypto';
import {isIP} from 'node:net';
import type Database from 'better-sqlite3';
import {StudyError} from './study-error';

export function expectedOrigin(req: Request) {
  const configured = process.env.APP_ORIGIN?.trim();
  if (configured) {
    let url: URL;
    try { url = new URL(configured); } catch { throw new StudyError(503, 'Invalid APP_ORIGIN configuration.'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
        url.pathname !== '/' || url.search || url.hash) throw new StudyError(503, 'Invalid APP_ORIGIN configuration.');
    return url.origin;
  }
  const url = new URL(req.url);
  try { return req.headers.get('host') ? new URL(url.protocol + '//' + req.headers.get('host')).origin : url.origin; }
  catch { throw new StudyError(400, 'Invalid request host.'); }
}

export function checkOrigin(req: Request) {
  const origin = req.headers.get('origin');
  if (origin && origin !== expectedOrigin(req)) throw new StudyError(403, 'Nguồn yêu cầu không hợp lệ.');
}

function limitFromEnv(name: string, fallback: number) {
  const value = process.env[name]?.trim();
  if (!value) return fallback;
  if (!/^\d{1,7}$/.test(value)) throw new StudyError(503, 'Invalid service budget configuration.');
  return Number(value);
}

// Forwarded addresses are accepted only behind an explicitly trusted proxy
// configured to replace incoming X-Forwarded-For, never append untrusted values.
export function clientScope(req?: Request) {
  if (process.env.TRUST_PROXY !== '1' || !req) return 'direct';
  const address = req.headers.get('x-forwarded-for')?.trim();
  if (!address || !isIP(address)) throw new StudyError(503, 'Trusted proxy must provide one client IP address.');
  return 'ip:' + createHash('sha256').update(address).digest('hex');
}

function increment(db: Database.Database, scope: string, day: string, kind: string, limit: number) {
  if (limit < 1) throw new StudyError(429, 'Bạn đã dùng hết lượt dịch vụ hôm nay. Hãy tiếp tục luyện theo mẫu.');
  const row = db.prepare('INSERT INTO study_usage_limits(scope,day,kind,count) VALUES(?,?,?,1) ON CONFLICT(scope,day,kind) DO UPDATE SET count=count+1 WHERE count < ? RETURNING count').get(scope, day, kind, limit);
  if (!row) throw new StudyError(429, 'Bạn đã dùng hết lượt dịch vụ hôm nay. Hãy tiếp tục luyện theo mẫu.');
}

export function reserveServiceUsage(db: Database.Database, profile: string, kind: 'tutor' | 'speech', limit: number, req?: Request) {
  const day = new Date().toISOString().slice(0, 10);
  const prefix = kind === 'tutor' ? 'AI' : 'SPEECH';
  const instanceLimit = limitFromEnv(prefix + '_INSTANCE_DAILY_LIMIT', limit);
  const addressLimit = limitFromEnv(prefix + '_IP_DAILY_LIMIT', limit * 2);
  const scope = clientScope(req);
  db.transaction(() => {
    // Throwing on any failed reservation rolls back every counter.
    increment(db, 'instance', day, kind, instanceLimit);
    increment(db, scope, day, kind, addressLimit);
    if (limit < 1) throw new StudyError(429, 'Service unavailable.');
    const row = db.prepare('INSERT INTO study_usage(profile_id,day,kind,count) VALUES(?,?,?,1) ON CONFLICT(profile_id,day,kind) DO UPDATE SET count=count+1 WHERE count < ? RETURNING count').get(profile, day, kind, limit);
    if (!row) throw new StudyError(429, 'Bạn đã dùng hết lượt dịch vụ hôm nay. Hãy tiếp tục luyện theo mẫu.');
  })();
}

export function reserveRecoveryAttempt(db: Database.Database, req: Request) {
  const hour = new Date().toISOString().slice(0, 13);
  const scope = clientScope(req);
  db.transaction(() => {
    increment(db, 'instance', hour, 'recovery', 120);
    increment(db, scope, hour, 'recovery', 30);
  })();
}
