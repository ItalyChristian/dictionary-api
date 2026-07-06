import { QueryHandler } from '../interfaces/QueryHandler';
import { GetHistoryQuery } from './GetHistoryQuery';
import { HistoryRepository } from '../../../domain/repositories/HistoryRepository';

export interface HistoryView {
  word: string;
  details: any;
  viewedAt: Date;
}

export class GetHistoryQueryHandler
  implements QueryHandler<GetHistoryQuery, { history: HistoryView[] }>
{
  constructor(
    private readonly historyRepository: HistoryRepository
  ) {}

  async handle(query: GetHistoryQuery): Promise<{ history: HistoryView[] }> {
    const entries = await this.historyRepository.findByUser(
      query.userId,
      query.limit
    );

    const history = entries.map((entry) => ({
      word: entry.word.getWord(),
      details: entry.word.toJSON(),
      viewedAt: entry.viewedAt
    }));

    return { history };
  }
}
