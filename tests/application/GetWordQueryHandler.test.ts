import { describe, it, expect, beforeEach } from 'vitest';
import { GetWordQueryHandler } from '@core/application/queries/words/GetWordQueryHandler';
import { GetWordQuery } from '@core/application/queries/words/GetWordQuery';
import { User } from '@core/domain/entities/User';
import { Word } from '@core/domain/entities/Word';
import { WordId } from '@core/domain/value-objects/WordId';
import { WordViewedEvent } from '@core/domain/events/WordViewedEvent';
import {
  createWordRepositoryMock,
  createUserRepositoryMock,
  createCacheMock,
  createDictionaryApiMock,
  createEventBusMock,
  sampleWordDetails
} from '../helpers/mocks';

describe('GetWordQueryHandler', () => {
  let wordRepository: ReturnType<typeof createWordRepositoryMock>;
  let userRepository: ReturnType<typeof createUserRepositoryMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let dictionaryApi: ReturnType<typeof createDictionaryApiMock>;
  let eventBus: ReturnType<typeof createEventBusMock>;
  let handler: GetWordQueryHandler;

  beforeEach(() => {
    wordRepository = createWordRepositoryMock();
    userRepository = createUserRepositoryMock();
    cache = createCacheMock();
    dictionaryApi = createDictionaryApiMock();
    eventBus = createEventBusMock();
    handler = new GetWordQueryHandler(
      wordRepository,
      userRepository,
      cache,
      dictionaryApi,
      eventBus
    );
  });

  describe('cache hit', () => {
    it('returns cached details and refreshes stats from the database', async () => {
      const cached = { word: 'apple', meanings: [], phonetics: [] };
      (cache.get as any).mockResolvedValue(cached);
      const word = Word.reconstitute('apple', 'apple', [], [], 5, 9, new Date());
      (wordRepository.findByWord as any).mockResolvedValue(word);

      const result = await handler.handle(new GetWordQuery('apple'));

      expect(result.fromCache).toBe(true);
      expect(result.word).toBe('apple');
      expect(word.getViewCount()).toBe(10);
      expect(wordRepository.save).toHaveBeenCalledWith(word);
      expect(cache.set).toHaveBeenCalled();
      expect(dictionaryApi.fetchWordDetails).not.toHaveBeenCalled();
    });

    it('publishes a WordViewedEvent (source cache) and resolves favorite when a user is given', async () => {
      (cache.get as any).mockResolvedValue({ word: 'apple' });
      const word = Word.reconstitute('apple', 'apple', [], [], 0, 0, new Date());
      (wordRepository.findByWord as any).mockResolvedValue(word);

      const user = User.create('Alice', 'alice@example.com', 'secret1!');
      user.addFavorite(WordId.create('apple'));
      (userRepository.findById as any).mockResolvedValue(user);

      const result = await handler.handle(new GetWordQuery('apple', user.getId()));

      expect(result.isFavorite).toBe(true);
      expect(eventBus.publish).toHaveBeenCalledOnce();
      const event = (eventBus.publish as any).mock.calls[0][0] as WordViewedEvent;
      expect(event).toBeInstanceOf(WordViewedEvent);
      expect(event.source).toBe('cache');
    });

    it('does not publish an event when no user is given', async () => {
      (cache.get as any).mockResolvedValue({ word: 'apple' });
      (wordRepository.findByWord as any).mockResolvedValue(null);

      await handler.handle(new GetWordQuery('apple'));

      expect(eventBus.publish).not.toHaveBeenCalled();
    });
  });

  describe('database hit', () => {
    it('returns details from the database without calling the external API', async () => {
      const word = Word.reconstitute(
        'apple',
        'apple',
        sampleWordDetails('apple').meanings,
        sampleWordDetails('apple').phonetics,
        0,
        2,
        new Date()
      );
      (wordRepository.findByWord as any).mockResolvedValue(word);

      const result = await handler.handle(new GetWordQuery('apple'));

      expect(result.fromCache).toBe(false);
      expect(word.getViewCount()).toBe(3);
      expect(dictionaryApi.fetchWordDetails).not.toHaveBeenCalled();
      expect(cache.set).toHaveBeenCalled();
    });
  });

  describe('api fallback', () => {
    it('fetches details from the external API and creates a new word', async () => {
      (wordRepository.findByWord as any).mockResolvedValue(null);
      (dictionaryApi.fetchWordDetails as any).mockResolvedValue(
        sampleWordDetails('apple')
      );

      const result = await handler.handle(new GetWordQuery('apple'));

      expect(result.fromCache).toBe(false);
      expect(dictionaryApi.fetchWordDetails).toHaveBeenCalledWith('apple');
      expect(wordRepository.save).toHaveBeenCalled();
      const saved = (wordRepository.save as any).mock.calls[0][0] as Word;
      expect(saved.getViewCount()).toBe(1);
      expect(saved.hasDetails()).toBe(true);
    });

    it('enriches an existing word that has no details', async () => {
      const empty = Word.create('apple', [], []);
      (wordRepository.findByWord as any).mockResolvedValue(empty);
      (dictionaryApi.fetchWordDetails as any).mockResolvedValue(
        sampleWordDetails('apple')
      );

      await handler.handle(new GetWordQuery('apple'));

      expect(empty.hasDetails()).toBe(true);
      expect(dictionaryApi.fetchWordDetails).toHaveBeenCalledOnce();
    });
  });
});
