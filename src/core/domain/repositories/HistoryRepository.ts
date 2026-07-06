import { Word } from '../entities/Word';
import { HistoryEntry } from './types/HistoryEntry';

export interface HistoryRepository {
  addEntry(userId: string, wordId: string, word: Word): Promise<void>;
  findByUser(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<{ entries: HistoryEntry[]; total: number }>;
  getRecentWords(userId: string, limit: number): Promise<string[]>;
}
