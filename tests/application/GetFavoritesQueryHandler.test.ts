import { describe, it, expect, beforeEach } from 'vitest';
import { GetFavoritesQueryHandler } from '@core/application/queries/words/GetFavoritesQueryHandler';
import { GetFavoritesQuery } from '@core/application/queries/words/GetFavoritesQuery';
import { createUserRepositoryMock } from '../helpers/mocks';

describe('GetFavoritesQueryHandler', () => {
  let userRepository: ReturnType<typeof createUserRepositoryMock>;
  let handler: GetFavoritesQueryHandler;

  beforeEach(() => {
    userRepository = createUserRepositoryMock();
    handler = new GetFavoritesQueryHandler(userRepository);
  });

  it('maps favorite entries into the paginated view', async () => {
    const favoritedAt = new Date('2024-01-02T00:00:00Z');
    (userRepository.findFavoritesByUser as any).mockResolvedValue({
      entries: [
        { userId: 'u1', wordId: 'apple', favoritedAt },
        { userId: 'u1', wordId: 'banana', favoritedAt }
      ],
      total: 2
    });

    const result = await handler.handle(new GetFavoritesQuery('u1', 1, 20));

    expect(userRepository.findFavoritesByUser).toHaveBeenCalledWith('u1', 1, 20);
    expect(result.results).toEqual([
      { word: 'apple', added: favoritedAt },
      { word: 'banana', added: favoritedAt }
    ]);
    expect(result.totalDocs).toBe(2);
    expect(result.page).toBe(1);
  });

  it('returns an empty page when the user has no favorites', async () => {
    const result = await handler.handle(new GetFavoritesQuery('u1'));
    expect(result.results).toEqual([]);
    expect(result.totalDocs).toBe(0);
    expect(result.hasNext).toBe(false);
  });
});
