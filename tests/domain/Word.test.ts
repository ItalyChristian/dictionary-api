import { describe, it, expect } from 'vitest';
import { Word } from '@core/domain/entities/Word';
import type { Meaning, Phonetic } from '@core/domain/entities/types/types';

const meanings: Meaning[] = [
  {
    partOfSpeech: 'noun',
    definitions: [{ definition: 'A greeting.' }]
  }
];
const phonetics: Phonetic[] = [{ text: '/həˈloʊ/' }];

describe('Word', () => {
  describe('create', () => {
    it('creates a word normalizing to lowercase with zero counters', () => {
      const word = Word.create('Hello', meanings, phonetics);

      expect(word.getWord()).toBe('hello');
      expect(word.getId().getValue()).toBe('hello');
      expect(word.getFavoriteCount()).toBe(0);
      expect(word.getViewCount()).toBe(0);
      expect(word.getCreatedAt()).toBeInstanceOf(Date);
      expect(word.getMeanings()).toEqual(meanings);
      expect(word.getPhonetics()).toEqual(phonetics);
    });
  });

  describe('reconstitute', () => {
    it('rebuilds a word preserving counters', () => {
      const created = new Date('2024-01-01T00:00:00Z');
      const word = Word.reconstitute(
        'hello',
        'hello',
        meanings,
        phonetics,
        5,
        10,
        created
      );

      expect(word.getFavoriteCount()).toBe(5);
      expect(word.getViewCount()).toBe(10);
      expect(word.getCreatedAt()).toBe(created);
    });
  });

  describe('counters', () => {
    it('increments views', () => {
      const word = Word.create('hello', meanings, phonetics);
      word.incrementViews();
      word.incrementViews();
      expect(word.getViewCount()).toBe(2);
    });

    it('increments favorites', () => {
      const word = Word.create('hello', meanings, phonetics);
      word.incrementFavorites();
      expect(word.getFavoriteCount()).toBe(1);
    });

    it('decrements favorites but never below zero', () => {
      const word = Word.create('hello', meanings, phonetics);
      word.incrementFavorites();
      word.decrementFavorites();
      word.decrementFavorites();
      expect(word.getFavoriteCount()).toBe(0);
    });
  });

  describe('details', () => {
    it('reports hasDetails based on meanings', () => {
      expect(Word.create('hello', meanings, phonetics).hasDetails()).toBe(true);
      expect(Word.create('hello', [], []).hasDetails()).toBe(false);
    });

    it('enriches meanings and phonetics', () => {
      const word = Word.create('hello', [], []);
      expect(word.hasDetails()).toBe(false);

      word.enrich(meanings, phonetics);

      expect(word.hasDetails()).toBe(true);
      expect(word.getMeanings()).toEqual(meanings);
      expect(word.getPhonetics()).toEqual(phonetics);
    });
  });

  describe('immutability of getters', () => {
    it('returns copies of meanings and phonetics', () => {
      const word = Word.create('hello', meanings, phonetics);
      word.getMeanings().pop();
      word.getPhonetics().pop();
      expect(word.getMeanings()).toHaveLength(1);
      expect(word.getPhonetics()).toHaveLength(1);
    });
  });

  describe('toJSON', () => {
    it('serializes word with stats', () => {
      const word = Word.reconstitute(
        'hello',
        'hello',
        meanings,
        phonetics,
        3,
        7,
        new Date()
      );

      expect(word.toJSON()).toEqual({
        word: 'hello',
        meanings,
        phonetics,
        stats: { favorites: 3, views: 7 }
      });
    });
  });
});
