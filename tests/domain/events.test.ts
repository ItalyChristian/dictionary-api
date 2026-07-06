import { describe, it, expect } from 'vitest';
import { UserRegisteredEvent } from '@core/domain/events/UserRegisteredEvent';
import { WordFavoritedEvent } from '@core/domain/events/WordFavoritedEvent';
import { WordUnfavoritedEvent } from '@core/domain/events/WordUnfavoritedEvent';
import { WordViewedEvent } from '@core/domain/events/WordViewedEvent';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe('Domain events', () => {
  it('UserRegisteredEvent carries its data and metadata', () => {
    const event = new UserRegisteredEvent('user-1', 'Alice', 'alice@example.com');

    expect(event.eventName).toBe('user.registered');
    expect(event.aggregateId).toBe('user-1');
    expect(event.name).toBe('Alice');
    expect(event.email).toBe('alice@example.com');
    expect(event.eventId).toMatch(UUID);
    expect(event.occurredOn).toBeInstanceOf(Date);
  });

  it('WordFavoritedEvent carries its data', () => {
    const event = new WordFavoritedEvent('agg', 'user-1', 'word-1', 'apple');
    expect(event.eventName).toBe('word.favorited');
    expect(event.userId).toBe('user-1');
    expect(event.wordId).toBe('word-1');
    expect(event.word).toBe('apple');
    expect(event.eventId).toMatch(UUID);
  });

  it('WordUnfavoritedEvent carries its data', () => {
    const event = new WordUnfavoritedEvent('agg', 'user-1', 'word-1', 'apple');
    expect(event.eventName).toBe('word.unfavorited');
    expect(event.userId).toBe('user-1');
    expect(event.word).toBe('apple');
  });

  it('WordViewedEvent carries its source', () => {
    const event = new WordViewedEvent('apple', 'user-1', 'apple', 'cache');
    expect(event.eventName).toBe('word.viewed');
    expect(event.source).toBe('cache');
    expect(event.aggregateId).toBe('apple');
  });

  it('generates unique event ids', () => {
    const a = new WordViewedEvent('apple', 'u', 'apple', 'api');
    const b = new WordViewedEvent('apple', 'u', 'apple', 'api');
    expect(a.eventId).not.toBe(b.eventId);
  });
});
