import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { uniqueIndex } from 'drizzle-orm/pg-core/indexes';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').notNull()
});

export const userFavorites = pgTable('user_favorites', {
  userId: uuid('user_id').notNull(),
  wordId: text('word_id').notNull(),
  favoritedAt: timestamp('favorited_at').notNull()
});

export const words = pgTable('words', {
  id: text('id').primaryKey(),
  word: text('word').notNull().unique(),
  meanings: jsonb('meanings').notNull(),
  phonetics: jsonb('phonetics').notNull(),
  favoriteCount: integer('favorite_count').notNull().default(0),
  viewCount: integer('view_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull()
});

export const wordHistory = pgTable(
  'word_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    wordId: text('word_id').notNull(),
    word: text('word').notNull(),
    viewedAt: timestamp('viewed_at').notNull()
  },
  // `table` is typed as `any`: the extra-config callback param isn't inferred
  // under this tsconfig (see the uniqueIndex import note above).
  (table: any) => [
    uniqueIndex('word_history_user_word_unique').on(table.userId, table.wordId)
  ]
);
