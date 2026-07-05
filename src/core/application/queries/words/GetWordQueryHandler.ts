import { QueryHandler } from '../interfaces/QueryHandler';
import { GetWordQuery } from './GetWordQuery';
import { WordRepository } from '../../../domain/repositories/WordRepository';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { CachePort } from '../../../ports/cache/CachePort';
import { DictionaryApiPort } from '../../../ports/api/DictionaryApiPort';
import { EventBusPort } from '../../../ports/event-bus/EventBusPort';
import { WordViewedEvent } from '../../../domain/events/WordViewedEvent';
import { WordId } from '../../../domain/value-objects/WordId';
import { Word } from '@core/domain/entities/Word';

export class GetWordQueryHandler
  implements QueryHandler<GetWordQuery, { word: string; details: any; isFavorite: boolean }>
{
  constructor(
    private readonly wordRepository: WordRepository,
    private readonly userRepository: UserRepository,
    private readonly cache: CachePort,
    private readonly dictionaryApi: DictionaryApiPort,
    private readonly eventBus: EventBusPort
  ) {}

  async handle(query: GetWordQuery): Promise<{
    word: string;
    details: any;
    isFavorite: boolean;
  }> {
    let isFavorite = false;
    let source: 'cache' | 'database' | 'api' = 'api';

    const cacheKey = `word:${query.word}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) {
      source = 'cache';
      
      if (query.userId) {
        const user = await this.userRepository.findById(query.userId);
        if (user) {
          isFavorite = user.isFavorite(WordId.create(query.word));
        }
      }

      if (query.userId) {
        await this.eventBus.publish(
          new WordViewedEvent(query.word, query.userId, query.word, source)
        );
      }

      return {
        word: query.word,
        details: cached,
        isFavorite
      };
    }

    let word = await this.wordRepository.findByWord(query.word);
    if (word) {
      source = 'database';
      word.incrementViews();
      await this.wordRepository.save(word);
      
      await this.cache.set(cacheKey, word.toJSON(), 3600);
      
      if (query.userId) {
        const user = await this.userRepository.findById(query.userId);
        if (user) {
          isFavorite = user.isFavorite(word.getId());
        }
      }
    } else {
      const apiData = await this.dictionaryApi.fetchWordDetails(query.word);
      
      word = Word.create(
        query.word,
        apiData.meanings,
        apiData.phonetics
      );
      word.incrementViews();
      
      await this.wordRepository.save(word);
      await this.cache.set(cacheKey, word.toJSON(), 3600);
    }

    if (query.userId) {
      await this.eventBus.publish(
        new WordViewedEvent(query.word, query.userId, query.word, source)
      );
    }

    return {
      word: query.word,
      details: word.toJSON(),
      isFavorite
    };
  }
}