import { QueryHandler } from '../interfaces/QueryHandler';
import { GetHistoryQuery } from './GetHistoryQuery';
import { HistoryRepository } from '../../../domain/repositories/HistoryRepository';
import { PaginatedHistoryView } from './types/HistoryView';

export class GetHistoryQueryHandler
  implements QueryHandler<GetHistoryQuery, PaginatedHistoryView>
{
  constructor(
    private readonly historyRepository: HistoryRepository
  ) {}

  async handle(query: GetHistoryQuery): Promise<PaginatedHistoryView> {
    const { entries, total } = await this.historyRepository.findByUser(
      query.userId,
      query.page,
      query.limit
    );

    const results = entries.map((entry) => ({
      word: entry.word.getWord(),
      added: entry.viewedAt
    }));

    const totalPages = Math.max(1, Math.ceil(total / query.limit));

    return {
      results,
      totalDocs: total,
      page: query.page,
      totalPages,
      hasNext: query.page < totalPages,
      hasPrev: query.page > 1
    };
  }
}
