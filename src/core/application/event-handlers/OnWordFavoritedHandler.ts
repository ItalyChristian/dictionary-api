import { WordFavoritedEvent } from '../../domain/events/WordFavoritedEvent';
import { LoggerPort } from '../../ports/logger/LoggerPort';
import { CachePort } from '../../ports/cache/CachePort';

export class OnWordFavoritedHandler {
  constructor(
    private readonly logger: LoggerPort,
    private readonly cache: CachePort
  ) {}

  async handle(event: WordFavoritedEvent): Promise<void> {
    try {
      await this.cache.invalidatePattern(`user:${event.userId}:favorites`);
      await this.cache.invalidatePattern(`user:${event.userId}:history`);
      
      this.logger.info('Word favorited', {
        userId: event.userId,
        wordId: event.wordId,
        word: event.word,
        timestamp: event.occurredOn
      });
      
    } catch (error) {
      this.logger.error('Error handling WordFavoritedEvent:', error);
    }
  }
}