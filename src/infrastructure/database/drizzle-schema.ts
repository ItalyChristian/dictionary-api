import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').notNull()
});

export const userFavorites = pgTable('user_favorites', {
  userId: uuid('user_id').notNull(),
  wordId: text('word_id').notNull(),
  favoritedAt: timestamp('favorited_at').notNull()
});
