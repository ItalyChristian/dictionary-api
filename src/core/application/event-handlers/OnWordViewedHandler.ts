import { Word } from '../../domain/entities/Word';
import { WordViewedEvent } from '../../domain/events/WordViewedEvent';
import { HistoryRepository } from '../../domain/repositories/HistoryRepository';

export class OnWordViewedHandler {
  constructor(
    private readonly historyRepository: HistoryRepository
  ) {}

  async handle(event: WordViewedEvent): Promise<void> {
    try {
      const word = Word.create(event.word, [], []);

      await this.historyRepository.addEntry(
        event.userId,
        event.aggregateId,
        word
      );

    } catch (error) {
      console.error('Error handling WordViewedEvent:', error);
    }
  }
}