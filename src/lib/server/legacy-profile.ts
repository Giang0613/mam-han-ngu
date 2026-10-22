import type Database from 'better-sqlite3';

type LegacyUser = {name: string; xp: number};
type LegacyCard = {
  id: number; hanzi: string; pinyin: string; meaning: string;
  interval: number; repetition: number; ease_factor: number; next_review_at: number;
};

/** Adopt optional pre-study tables once, without modifying or deleting them. */
export function createStudyProfile(db: Database.Database, id: string, now: string) {
  db.transaction(() => {
    const adopted = db.prepare("SELECT value FROM study_meta WHERE key='legacy_adopted'").get();
    const hasTable = (name: string) => !!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(name);
    const user = !adopted && hasTable('users')
      ? db.prepare('SELECT name,xp FROM users WHERE id=1').get() as LegacyUser | undefined
      : undefined;
    db.prepare('INSERT INTO study_profiles(id,name,legacy_xp,created_at) VALUES(?,?,?,?)').run(id, user?.name || 'Học viên', user?.xp || 0, now);
    if (adopted) return;
    const cards = hasTable('flashcards') ? db.prepare('SELECT * FROM flashcards').all() as LegacyCard[] : [];
    const insert = db.prepare('INSERT INTO study_cards(profile_id,id,hanzi,pinyin,meaning,source,interval,repetition,ease,due,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
    for (const card of cards) {
      insert.run(id, 'legacy-' + card.id, card.hanzi, card.pinyin, card.meaning, 'Thẻ đã có',
        card.interval, card.repetition, card.ease_factor / 1000,
        new Date(card.next_review_at * 1000).toISOString(), now);
    }
    db.prepare("INSERT INTO study_meta(key,value) VALUES('legacy_adopted',?)").run(id);
  })();
}
