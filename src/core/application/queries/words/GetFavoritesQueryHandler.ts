import { QueryHandler } from '../interfaces/QueryHandler';
import { GetFavoritesQuery } from './GetFavoritesQuery';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { PaginatedFavoriteView } from './types/FavoriteView';
import { buildPaginatedResult } from '@shared/types/PaginatedResult';

export class GetFavoritesQueryHandler
  implements QueryHandler<GetFavoritesQuery, PaginatedFavoriteView>
{
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  async handle(query: GetFavoritesQuery): Promise<PaginatedFavoriteView> {
    const { entries, total } = await this.userRepository.findFavoritesByUser(
      query.userId,
      query.page,
      query.limit
    );

    const results = entries.map((entry) => ({
      word: entry.wordId,
      added: entry.favoritedAt
    }));

    return buildPaginatedResult(results, total, query.page, query.limit);
  }
}
