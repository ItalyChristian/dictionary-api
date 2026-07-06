import { describe, it, expect, beforeEach } from 'vitest';
import { OnWordFavoritedHandler } from '@core/application/event-handlers/OnWordFavoritedHandler';
import { WordFavoritedEvent } from '@core/domain/events/WordFavoritedEvent';
import { createLoggerMock, createCacheMock } from '../helpers/mocks';

describe('OnWordFavoritedHandler', () => {
  let logger: ReturnType<typeof createLoggerMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let handler: OnWordFavoritedHandler;

  beforeEach(() => {
    logger = createLoggerMock();
    cache = createCacheMock();
    handler = new OnWordFavoritedHandler(logger, cache);
  });

  it('invalidates the user cache and logs the event', async () => {
    const event = new WordFavoritedEvent('agg', 'u1', 'apple', 'apple');

    await handler.handle(event);

    expect(cache.invalidatePattern).toHaveBeenCalledWith('user:u1:favorites');
    expect(cache.invalidatePattern).toHaveBeenCalledWith('user:u1:history');
    expect(logger.info).toHaveBeenCalledWith(
      'Word favorited',
      expect.objectContaining({ userId: 'u1', word: 'apple' })
    );
  });

  it('logs an error instead of throwing when the cache fails', async () => {
    (cache.invalidatePattern as any).mockRejectedValue(new Error('redis down'));
    const event = new WordFavoritedEvent('agg', 'u1', 'apple', 'apple');

    await expect(handler.handle(event)).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalled();
  });
});
