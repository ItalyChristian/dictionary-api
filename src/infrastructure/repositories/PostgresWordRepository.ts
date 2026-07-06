import { WordRepository } from '../../core/domain/repositories/WordRepository';
import { Word } from '../../core/domain/entities/Word';
import { WordId } from '../../core/domain/value-objects/WordId';
import { db } from '../database/connection.js';
import { words } from '../database/drizzle-schema.js';
import { desc, eq } from 'drizzle-orm';

type WordRow = typeof words.$inferSelect;

export class PostgresWordRepository implements WordRepository {
  async findById(id: WordId): Promise<Word | null> {
    const result = await db
      .select()
      .from(words)
      .where(eq(words.id, id.getValue()))
      .limit(1);

    if (result.length === 0) return null;

    return this.toEntity(result[0]);
  }

  async findByWord(word: string): Promise<Word | null> {
    const result = await db
      .select()
      .from(words)
      .where(eq(words.word, word.toLowerCase().trim()))
      .limit(1);

    if (result.length === 0) return null;

    return this.toEntity(result[0]);
  }

  async save(word: Word): Promise<void> {
    await db
      .insert(words)
      .values({
        id: word.getId().getValue(),
        word: word.getWord(),
        meanings: word.getMeanings(),
        phonetics: word.getPhonetics(),
        favoriteCount: word.getFavoriteCount(),
        viewCount: word.getViewCount(),
        createdAt: word.getCreatedAt()
      })
      .onConflictDoUpdate({
        target: words.id,
        set: {
          meanings: word.getMeanings(),
          phonetics: word.getPhonetics(),
          favoriteCount: word.getFavoriteCount(),
          viewCount: word.getViewCount()
        }
      });
  }

  async saveMany(wordsToSave: Word[]): Promise<void> {
    if (wordsToSave.length === 0) return;

    await db.transaction(async (trx: any) => {
      for (const word of wordsToSave) {
        await trx
          .insert(words)
          .values({
            id: word.getId().getValue(),
            word: word.getWord(),
            meanings: word.getMeanings(),
            phonetics: word.getPhonetics(),
            favoriteCount: word.getFavoriteCount(),
            viewCount: word.getViewCount(),
            createdAt: word.getCreatedAt()
          })
          .onConflictDoUpdate({
            target: words.id,
            set: {
              meanings: word.getMeanings(),
              phonetics: word.getPhonetics(),
              favoriteCount: word.getFavoriteCount(),
              viewCount: word.getViewCount()
            }
          });
      }
    });
  }

  async delete(id: WordId): Promise<void> {
    await db.delete(words).where(eq(words.id, id.getValue()));
  }

  async findPopular(limit: number): Promise<Word[]> {
    const result = await db
      .select()
      .from(words)
      .orderBy(desc(words.viewCount))
      .limit(limit);

    return result.map((row: WordRow) => this.toEntity(row));
  }

  async exists(word: string): Promise<boolean> {
    const result = await db
      .select({ id: words.id })
      .from(words)
      .where(eq(words.word, word.toLowerCase().trim()))
      .limit(1);

    return result.length > 0;
  }

  private toEntity(row: WordRow): Word {
    return Word.reconstitute(
      row.id,
      row.word,
      row.meanings,
      row.phonetics,
      row.favoriteCount,
      row.viewCount,
      row.createdAt
    );
  }
}
