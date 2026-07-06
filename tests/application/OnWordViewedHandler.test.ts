import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { OnWordViewedHandler } from '@core/application/event-handlers/OnWordViewedHandler';
import { WordViewedEvent } from '@core/domain/events/WordViewedEvent';
import { createHistoryRepositoryMock } from '../helpers/mocks';

describe('OnWordViewedHandler', () => {
  let historyRepository: ReturnType<typeof createHistoryRepositoryMock>;
  let handler: OnWordViewedHandler;

  beforeEach(() => {
    historyRepository = createHistoryRepositoryMock();
    handler = new OnWordViewedHandler(historyRepository);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds a history entry for the viewed word', async () => {
    const event = new WordViewedEvent('apple', 'u1', 'apple', 'api');

    await handler.handle(event);

    expect(historyRepository.addEntry).toHaveBeenCalledOnce();
    const [userId, aggregateId, word] = (historyRepository.addEntry as any).mock
      .calls[0];
    expect(userId).toBe('u1');
    expect(aggregateId).toBe('apple');
    expect(word.getWord()).toBe('apple');
  });

  it('swallows repository errors and logs them', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (historyRepository.addEntry as any).mockRejectedValue(new Error('db down'));
    const event = new WordViewedEvent('apple', 'u1', 'apple', 'api');

    await expect(handler.handle(event)).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalled();
  });
});
