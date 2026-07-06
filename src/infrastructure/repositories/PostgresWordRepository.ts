import {
  WordRepository,
  WordSearchParams,
  WordSearchResult
} from '../../core/domain/repositories/WordRepository';
import { Word } from '../../core/domain/entities/Word';
import { WordId } from '../../core/domain/value-objects/WordId';
import { db } from '../database/connection.js';
import { words } from '../database/drizzle-schema.js';
import { desc, eq } from 'drizzle-orm';
import { and, asc, count, gt, ilike, lt } from 'drizzle-orm/sql';

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

  async searchPaginated(params: WordSearchParams): Promise<WordSearchResult> {
    const { search, limit, cursorWord, direction } = params;

    const searchFilter = search
      ? ilike(words.word, `${search.toLowerCase().trim()}%`)
      : undefined;

    const totalRes = await db
      .select({ value: count() })
      .from(words)
      .where(searchFilter);
    const totalDocs = Number(totalRes[0]?.value ?? 0);

    const isPrev = direction === 'prev' && Boolean(cursorWord);

    const cursorFilter = cursorWord
      ? isPrev
        ? lt(words.word, cursorWord)
        : gt(words.word, cursorWord)
      : undefined;

    const pageFilter =
      searchFilter && cursorFilter
        ? and(searchFilter, cursorFilter)
        : (searchFilter ?? cursorFilter);

    const rows = await db
      .select({ word: words.word })
      .from(words)
      .where(pageFilter)
      .orderBy(isPrev ? desc(words.word) : asc(words.word))
      .limit(limit + 1);

    const hasExtra = rows.length > limit;
    const pageRows = hasExtra ? rows.slice(0, limit) : rows;

    const ordered = isPrev ? pageRows.reverse() : pageRows;
    const wordList = ordered.map((row: { word: string }) => row.word);

    const hasNext = isPrev ? true : hasExtra;
    const hasPrev = isPrev ? hasExtra : Boolean(cursorWord);

    return {
      words: wordList,
      totalDocs,
      hasNext: wordList.length === 0 ? false : hasNext,
      hasPrev: wordList.length === 0 ? false : hasPrev,
      firstWord: wordList[0] ?? null,
      lastWord: wordList[wordList.length - 1] ?? null
    };
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
