import { PaginatedResult } from '@shared/types/PaginatedResult';

export interface HistoryView {
  word: string;
  added: Date;
}

export type PaginatedHistoryView = PaginatedResult<HistoryView>;
