import Database from 'better-sqlite3';
const db=new Database('local.db');
db.pragma('journal_mode = WAL');
db.transaction(()=>db.exec(`
CREATE TABLE IF NOT EXISTS study_profiles(id TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT 'Học viên', goal INTEGER NOT NULL DEFAULT 10, start_level INTEGER NOT NULL DEFAULT 1, pinyin INTEGER NOT NULL DEFAULT 1, rate REAL NOT NULL DEFAULT 0.8, muted INTEGER NOT NULL DEFAULT 0, legacy_xp INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS study_meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS study_attempts(profile_id TEXT NOT NULL,event_id TEXT NOT NULL,exercise_id TEXT NOT NULL,answer TEXT NOT NULL,correct INTEGER NOT NULL,hint INTEGER NOT NULL,concept TEXT NOT NULL,skill TEXT NOT NULL,version TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(profile_id,event_id));
CREATE INDEX IF NOT EXISTS idx_study_attempts ON study_attempts(profile_id,created_at);
CREATE TABLE IF NOT EXISTS study_cards(profile_id TEXT NOT NULL,id TEXT NOT NULL,hanzi TEXT NOT NULL,pinyin TEXT NOT NULL,meaning TEXT NOT NULL,language TEXT NOT NULL DEFAULT 'vi',source TEXT NOT NULL,interval INTEGER NOT NULL DEFAULT 0,repetition INTEGER NOT NULL DEFAULT 0,ease REAL NOT NULL DEFAULT 2.5,due TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,PRIMARY KEY(profile_id,id));
CREATE TABLE IF NOT EXISTS study_review_events(profile_id TEXT NOT NULL,event_id TEXT NOT NULL,card_id TEXT NOT NULL,rating INTEGER NOT NULL,base_revision INTEGER NOT NULL,result TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(profile_id,event_id));
CREATE TABLE IF NOT EXISTS study_bookmarks(profile_id TEXT NOT NULL,grammar_id TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(profile_id,grammar_id));
CREATE TABLE IF NOT EXISTS study_placements(profile_id TEXT NOT NULL,event_id TEXT NOT NULL,answers TEXT NOT NULL,result TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(profile_id,event_id));
CREATE TABLE IF NOT EXISTS study_tutor(profile_id TEXT NOT NULL,event_id TEXT NOT NULL,scenario TEXT NOT NULL,input TEXT NOT NULL,output TEXT,state TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(profile_id,event_id));
CREATE TABLE IF NOT EXISTS study_usage(profile_id TEXT NOT NULL,day TEXT NOT NULL,kind TEXT NOT NULL,count INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(profile_id,day,kind));
CREATE TABLE IF NOT EXISTS study_hsk_drafts(profile_id TEXT NOT NULL,task_id TEXT NOT NULL,revision TEXT NOT NULL,text TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(profile_id,task_id,revision));
`))();
console.log('Study schema ready. Existing users and flashcards preserved.');db.close();
