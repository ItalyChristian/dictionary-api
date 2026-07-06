import { QueryHandler } from '../interfaces/QueryHandler';
import { GetWordsQuery } from './GetWordsQuery';
import { WordRepository } from '../../../domain/repositories/WordRepository';
import { CachePort } from '../../../ports/cache/CachePort';
import { GetWordsResult, WordListView } from './types/WordListView';
import {
  buildCursorResult,
  decodeCursor
} from '@shared/types/CursorPaginatedResult';

export class GetWordsQueryHandler
  implements QueryHandler<GetWordsQuery, GetWordsResult>
{
  private static readonly CACHE_TTL = 3600;

  constructor(
    private readonly wordRepository: WordRepository,
    private readonly cache: CachePort
  ) {}

  async handle(query: GetWordsQuery): Promise<GetWordsResult> {
    const search = query.search?.trim() || undefined;

    const cacheKey = `words:list:${search ?? ''}:${query.limit}:${query.cursor ?? ''}`;

    const cached = await this.cache.get<WordListView>(cacheKey);
    if (cached) {
      return { data: cached, fromCache: true };
    }

    const decoded = query.cursor ? decodeCursor(query.cursor) : undefined;

    const { words, totalDocs, hasNext, hasPrev, firstWord, lastWord } =
      await this.wordRepository.searchPaginated({
        search,
        limit: query.limit,
        cursorWord: decoded?.w,
        direction: decoded?.d
      });

    const data = buildCursorResult<string>({
      results: words,
      totalDocs,
      firstKey: firstWord,
      lastKey: lastWord,
      hasNext,
      hasPrev
    });

    await this.cache.set(cacheKey, data, GetWordsQueryHandler.CACHE_TTL);

    return { data, fromCache: false };
  }
}
