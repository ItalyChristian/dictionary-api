import { describe, it, expect, beforeEach } from 'vitest';
import { GetWordsQueryHandler } from '@core/application/queries/words/GetWordsQueryHandler';
import { GetWordsQuery } from '@core/application/queries/words/GetWordsQuery';
import { encodeCursor } from '@shared/types/CursorPaginatedResult';
import {
  createWordRepositoryMock,
  createCacheMock
} from '../helpers/mocks';

describe('GetWordsQueryHandler', () => {
  let wordRepository: ReturnType<typeof createWordRepositoryMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let handler: GetWordsQueryHandler;

  beforeEach(() => {
    wordRepository = createWordRepositoryMock();
    cache = createCacheMock();
    handler = new GetWordsQueryHandler(wordRepository, cache);
  });

  it('returns cached data when present without hitting the repository', async () => {
    const cachedView = {
      results: ['apple'],
      totalDocs: 1,
      previous: null,
      next: null,
      hasNext: false,
      hasPrev: false
    };
    (cache.get as any).mockResolvedValue(cachedView);

    const result = await handler.handle(new GetWordsQuery(undefined, 10));

    expect(result.fromCache).toBe(true);
    expect(result.data).toEqual(cachedView);
    expect(wordRepository.searchPaginated).not.toHaveBeenCalled();
  });

  it('queries the repository, builds a cursor result and caches it', async () => {
    (wordRepository.searchPaginated as any).mockResolvedValue({
      words: ['apple', 'banana'],
      totalDocs: 2,
      hasNext: true,
      hasPrev: false,
      firstWord: 'apple',
      lastWord: 'banana'
    });

    const result = await handler.handle(new GetWordsQuery('a', 2));

    expect(result.fromCache).toBe(false);
    expect(result.data.results).toEqual(['apple', 'banana']);
    expect(result.data.next).toBeTypeOf('string');
    expect(result.data.previous).toBeNull();
    expect(cache.set).toHaveBeenCalled();
  });

  it('decodes an incoming cursor and forwards it to the repository', async () => {
    const cursor = encodeCursor({ w: 'apple', d: 'next' });

    await handler.handle(new GetWordsQuery(undefined, 10, cursor));

    expect(wordRepository.searchPaginated).toHaveBeenCalledWith({
      search: undefined,
      limit: 10,
      cursorWord: 'apple',
      direction: 'next'
    });
  });

  it('normalizes a blank search into undefined', async () => {
    await handler.handle(new GetWordsQuery('   ', 10));

    expect(wordRepository.searchPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ search: undefined })
    );
  });
});
