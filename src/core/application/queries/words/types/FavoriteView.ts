import { PaginatedResult } from '@shared/types/PaginatedResult';

export interface FavoriteView {
  word: string;
  added: Date;
}

export type PaginatedFavoriteView = PaginatedResult<FavoriteView>;
