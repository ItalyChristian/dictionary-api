export interface HistoryView {
  word: string;
  added: Date;
}

export interface PaginatedHistoryView {
  results: HistoryView[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
