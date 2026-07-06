import { vi } from 'vitest';
import type { UserRepository } from '@core/domain/repositories/UserRepository';
import type { WordRepository } from '@core/domain/repositories/WordRepository';
import type { HistoryRepository } from '@core/domain/repositories/HistoryRepository';
import type { CachePort } from '@core/ports/cache/CachePort';
import type { EventBusPort } from '@core/ports/event-bus/EventBusPort';
import type { DictionaryApiPort } from '@core/ports/api/DictionaryApiPort';
import type { LoggerPort } from '@core/ports/logger/LoggerPort';
import type { WordDetails } from '@core/ports/api/DictionaryApiPort';

export function createUserRepositoryMock(): UserRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByEmail: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    exists: vi.fn().mockResolvedValue(false),
    findFavoritesByUser: vi.fn().mockResolvedValue({ entries: [], total: 0 })
  };
}

export function createWordRepositoryMock(): WordRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByWord: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    saveMany: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    findPopular: vi.fn().mockResolvedValue([]),
    exists: vi.fn().mockResolvedValue(false),
    searchPaginated: vi.fn().mockResolvedValue({
      words: [],
      totalDocs: 0,
      hasNext: false,
      hasPrev: false,
      firstWord: null,
      lastWord: null
    })
  };
}

export function createHistoryRepositoryMock(): HistoryRepository {
  return {
    addEntry: vi.fn().mockResolvedValue(undefined),
    findByUser: vi.fn().mockResolvedValue({ entries: [], total: 0 }),
    getRecentWords: vi.fn().mockResolvedValue([])
  };
}

export function createCacheMock(): CachePort {
  return {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    invalidatePattern: vi.fn().mockResolvedValue(undefined),
    getTTL: vi.fn().mockResolvedValue(null),
    increment: vi.fn().mockResolvedValue(1)
  };
}

export function createEventBusMock(): EventBusPort {
  return {
    publish: vi.fn().mockResolvedValue(undefined),
    publishMany: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn().mockResolvedValue(undefined)
  };
}

export function createDictionaryApiMock(): DictionaryApiPort {
  return {
    fetchWordDetails: vi.fn().mockResolvedValue(sampleWordDetails()),
    searchWords: vi.fn().mockResolvedValue([])
  };
}

export function createLoggerMock(): LoggerPort {
  return {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  } as unknown as LoggerPort;
}

export function sampleWordDetails(word = 'hello'): WordDetails {
  return {
    word,
    phonetics: [{ text: '/həˈloʊ/', audio: 'http://audio/hello.mp3' }],
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'A greeting.',
            example: 'She gave a warm hello.',
            synonyms: ['hi', 'greetings'],
            antonyms: ['goodbye']
          }
        ]
      }
    ]
  };
}
