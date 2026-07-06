import { QueryHandler } from '../interfaces/QueryHandler';
import { GetFavoritesQuery } from './GetFavoritesQuery';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { WordRepository } from '../../../domain/repositories/WordRepository';

export interface FavoriteView {
  word: string;
  details: any;
}

export class GetFavoritesQueryHandler
  implements QueryHandler<GetFavoritesQuery, { favorites: FavoriteView[] }>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly wordRepository: WordRepository
  ) {}

  async handle(query: GetFavoritesQuery): Promise<{ favorites: FavoriteView[] }> {
    const user = await this.userRepository.findById(query.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const favoriteIds = user.getFavorites();

    const favorites = await Promise.all(
      favoriteIds.map(async (wordId) => {
        const word = await this.wordRepository.findById(wordId);
        return {
          word: wordId.getValue(),
          details: word ? word.toJSON() : null
        };
      })
    );

    return { favorites };
  }
}
