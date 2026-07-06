import { describe, it, expect, beforeEach } from 'vitest';
import { GetHistoryQueryHandler } from '@core/application/queries/words/GetHistoryQueryHandler';
import { GetHistoryQuery } from '@core/application/queries/words/GetHistoryQuery';
import { Word } from '@core/domain/entities/Word';
import { createHistoryRepositoryMock } from '../helpers/mocks';

describe('GetHistoryQueryHandler', () => {
  let historyRepository: ReturnType<typeof createHistoryRepositoryMock>;
  let handler: GetHistoryQueryHandler;

  beforeEach(() => {
    historyRepository = createHistoryRepositoryMock();
    handler = new GetHistoryQueryHandler(historyRepository);
  });

  it('maps history entries into the paginated view', async () => {
    const viewedAt = new Date('2024-03-01T10:00:00Z');
    (historyRepository.findByUser as any).mockResolvedValue({
      entries: [
        {
          userId: 'u1',
          wordId: 'apple',
          word: Word.create('apple', [], []),
          viewedAt
        }
      ],
      total: 1
    });

    const result = await handler.handle(new GetHistoryQuery('u1', 1, 20));

    expect(historyRepository.findByUser).toHaveBeenCalledWith('u1', 1, 20);
    expect(result.results).toEqual([{ word: 'apple', added: viewedAt }]);
    expect(result.totalDocs).toBe(1);
  });

  it('returns an empty page when there is no history', async () => {
    const result = await handler.handle(new GetHistoryQuery('u1'));
    expect(result.results).toEqual([]);
    expect(result.totalDocs).toBe(0);
  });
});
