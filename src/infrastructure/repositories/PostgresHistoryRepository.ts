import {
  HistoryEntry,
  HistoryRepository
} from '../../core/domain/repositories/HistoryRepository';
import { Word } from '../../core/domain/entities/Word';
import { db } from '../database/connection.js';
import { wordHistory, words } from '../database/drizzle-schema.js';
import { desc, eq } from 'drizzle-orm';

type WordRow = typeof words.$inferSelect;
type HistoryRow = typeof wordHistory.$inferSelect;

export class PostgresHistoryRepository implements HistoryRepository {
  async addEntry(userId: string, wordId: string, word: Word): Promise<void> {
    await db.insert(wordHistory).values({
      userId,
      wordId,
      word: word.getWord(),
      viewedAt: new Date()
    });
  }

  async findByUser(userId: string, limit = 20): Promise<HistoryEntry[]> {
    const rows = await db
      .select({
        history: wordHistory,
        word: words
      })
      .from(wordHistory)
      .leftJoin(words, eq(words.id, wordHistory.wordId))
      .where(eq(wordHistory.userId, userId))
      .orderBy(desc(wordHistory.viewedAt))
      .limit(limit);

    return rows.map(
      (row: { history: HistoryRow; word: WordRow | null }) => ({
        userId: row.history.userId,
        wordId: row.history.wordId,
        word: this.toWord(row.history, row.word),
        viewedAt: row.history.viewedAt
      })
    );
  }

  async getRecentWords(userId: string, limit: number): Promise<string[]> {
    const rows = await db
      .selectDistinct({ word: wordHistory.word })
      .from(wordHistory)
      .where(eq(wordHistory.userId, userId))
      .orderBy(desc(wordHistory.word))
      .limit(limit);

    return rows.map((row: { word: string }) => row.word);
  }

  private toWord(history: HistoryRow, word: WordRow | null): Word {
    if (word) {
      return Word.reconstitute(
        word.id,
        word.word,
        word.meanings,
        word.phonetics,
        word.favoriteCount,
        word.viewCount,
        word.createdAt
      );
    }

    return Word.reconstitute(
      history.wordId,
      history.word,
      [],
      [],
      0,
      0,
      history.viewedAt
    );
  }
}
