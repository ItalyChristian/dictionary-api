import { describe, it, expect } from 'vitest';
import { User } from '@core/domain/entities/User';
import { WordId } from '@core/domain/value-objects/WordId';
import { UserRegisteredEvent } from '@core/domain/events/UserRegisteredEvent';
import { WordFavoritedEvent } from '@core/domain/events/WordFavoritedEvent';
import { WordUnfavoritedEvent } from '@core/domain/events/WordUnfavoritedEvent';

describe('User', () => {
  describe('create', () => {
    it('creates a user and raises a UserRegisteredEvent', () => {
      const user = User.create('Alice', 'alice@example.com', 'secret1!');

      expect(user.getName()).toBe('Alice');
      expect(user.getEmail()).toBe('alice@example.com');
      expect(user.getId()).toBeTruthy();
      expect(user.getCreatedAt()).toBeInstanceOf(Date);

      const events = user.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserRegisteredEvent);
    });

    it('trims the name', () => {
      const user = User.create('  Bob  ', 'bob@example.com', 'secret1!');
      expect(user.getName()).toBe('Bob');
    });

    it('throws when the name is empty', () => {
      expect(() => User.create('   ', 'x@y.com', 'secret1!')).toThrow(
        'Name must not be empty'
      );
    });

    it('propagates invalid email errors', () => {
      expect(() => User.create('Bob', 'not-an-email', 'secret1!')).toThrow(
        'Invalid email format'
      );
    });

    it('propagates weak password errors', () => {
      expect(() => User.create('Bob', 'bob@example.com', 'weak')).toThrow();
    });
  });

  describe('reconstitute', () => {
    it('rebuilds a user without raising events', () => {
      const created = new Date('2024-01-01T00:00:00Z');
      const user = User.reconstitute(
        'id-1',
        'Carol',
        'carol@example.com',
        '$argon2id$hash',
        ['apple', 'banana'],
        created
      );

      expect(user.getId()).toBe('id-1');
      expect(user.getName()).toBe('Carol');
      expect(user.getEmail()).toBe('carol@example.com');
      expect(user.getPassword()).toBe('$argon2id$hash');
      expect(user.getCreatedAt()).toBe(created);
      expect(user.getEvents()).toHaveLength(0);
      expect(user.getFavorites().map((w) => w.getValue()).sort()).toEqual([
        'apple',
        'banana'
      ]);
    });
  });

  describe('favorites', () => {
    it('adds a favorite and raises WordFavoritedEvent', () => {
      const user = User.create('Alice', 'alice@example.com', 'secret1!');
      user.clearEvents();

      user.addFavorite(WordId.create('apple'));

      expect(user.isFavorite(WordId.create('apple'))).toBe(true);
      const events = user.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(WordFavoritedEvent);
    });

    it('throws when favoriting the same word twice', () => {
      const user = User.create('Alice', 'alice@example.com', 'secret1!');
      user.addFavorite(WordId.create('apple'));
      expect(() => user.addFavorite(WordId.create('apple'))).toThrow(
        'Word already favorited'
      );
    });

    it('removes a favorite and raises WordUnfavoritedEvent', () => {
      const user = User.create('Alice', 'alice@example.com', 'secret1!');
      user.addFavorite(WordId.create('apple'));
      user.clearEvents();

      user.removeFavorite(WordId.create('apple'));

      expect(user.isFavorite(WordId.create('apple'))).toBe(false);
      const events = user.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(WordUnfavoritedEvent);
    });

    it('throws when removing a word that is not favorited', () => {
      const user = User.create('Alice', 'alice@example.com', 'secret1!');
      expect(() => user.removeFavorite(WordId.create('apple'))).toThrow(
        'Word not favorited'
      );
    });

    it('returns favorites as WordId list', () => {
      const user = User.create('Alice', 'alice@example.com', 'secret1!');
      user.addFavorite(WordId.create('apple'));
      user.addFavorite(WordId.create('banana'));

      const favorites = user.getFavorites();
      expect(favorites.every((f) => f instanceof WordId)).toBe(true);
      expect(favorites.map((f) => f.getValue()).sort()).toEqual([
        'apple',
        'banana'
      ]);
    });
  });

  describe('password', () => {
    it('hashes the password and verifies it', async () => {
      const user = User.create('Alice', 'alice@example.com', 'secret1!');
      await user.hashPassword();

      expect(user.getPassword().startsWith('$argon2')).toBe(true);
      expect(await user.verifyPassword('secret1!')).toBe(true);
      expect(await user.verifyPassword('wrong1!')).toBe(false);
    });
  });

  describe('events', () => {
    it('clears events', () => {
      const user = User.create('Alice', 'alice@example.com', 'secret1!');
      expect(user.getEvents().length).toBeGreaterThan(0);
      user.clearEvents();
      expect(user.getEvents()).toHaveLength(0);
    });

    it('returns a copy of events (immutability)', () => {
      const user = User.create('Alice', 'alice@example.com', 'secret1!');
      const events = user.getEvents();
      events.pop();
      expect(user.getEvents().length).toBe(1);
    });
  });
});
