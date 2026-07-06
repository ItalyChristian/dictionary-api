import { Word } from "@core/domain/entities/Word";

export interface HistoryEntry {
  userId: string;
  wordId: string;
  word: Word;
  viewedAt: Date;
}
