import { Word } from '../entities/Word';
import { WordId } from '../value-objects/WordId';

export interface WordSearchParams {
  search?: string;
  limit: number;
  cursorWord?: string;
  direction?: 'next' | 'prev';
}

export interface WordSearchResult {
  words: string[];
  totalDocs: number;
  hasNext: boolean;
  hasPrev: boolean;
  firstWord: string | null;
  lastWord: string | null;
}

export interface WordRepository {
  findById(id: WordId): Promise<Word | null>;
  findByWord(word: string): Promise<Word | null>;
  save(word: Word): Promise<void>;
  saveMany(words: Word[]): Promise<void>;
  delete(id: WordId): Promise<void>;
  findPopular(limit: number): Promise<Word[]>;
  exists(word: string): Promise<boolean>;
  searchPaginated(params: WordSearchParams): Promise<WordSearchResult>;
}