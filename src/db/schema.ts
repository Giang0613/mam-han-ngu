import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const flashcards = sqliteTable('flashcards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  hanzi: text('hanzi').notNull(),
  pinyin: text('pinyin').notNull(),
  meaning: text('meaning').notNull(),
  
  // SM-2 Spaced Repetition Fields
  interval: integer('interval').default(0).notNull(),
  repetition: integer('repetition').default(0).notNull(),
  easeFactor: integer('ease_factor').default(2500).notNull(), // 2.5 * 1000
  nextReviewAt: integer('next_review_at', { mode: 'timestamp' }).notNull(),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().default('Học viên'),
  xp: integer('xp').notNull().default(0),
  level: integer('level').notNull().default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
