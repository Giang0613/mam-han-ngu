import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Store DB in the root directory
export const sqlite = new Database(path.resolve(process.cwd(), 'local.db'));
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('busy_timeout = 5000');
export const db = drizzle(sqlite, { schema });
