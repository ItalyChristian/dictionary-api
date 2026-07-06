import { PaginatedResult } from '@shared/types/PaginatedResult';

export interface HistoryView {
  word: string;
  added: Date;
  viewedAt: Date;
}

export type PaginatedHistoryView = PaginatedResult<HistoryView>;
