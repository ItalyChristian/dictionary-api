import { CursorPaginatedResult } from '@shared/types/CursorPaginatedResult';

export type WordListView = CursorPaginatedResult<string>;

export interface GetWordsResult {
  data: WordListView;
  fromCache: boolean;
}
