import { Word } from '../entities/Word';

export interface HistoryEntry {
  userId: string;
  wordId: string;
  word: Word;
  viewedAt: Date;
}

export interface HistoryRepository {
  addEntry(userId: string, wordId: string, word: Word): Promise<void>;
  findByUser(userId: string, limit?: number): Promise<HistoryEntry[]>;
  getRecentWords(userId: string, limit: number): Promise<string[]>;
}
