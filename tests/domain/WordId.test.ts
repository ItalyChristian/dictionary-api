import { describe, it, expect } from 'vitest';
import { WordId } from '@core/domain/value-objects/WordId';

describe('WordId', () => {
  it('creates from a value normalizing to lowercase and trimming', () => {
    const id = WordId.create('  Hello  ');
    expect(id.getValue()).toBe('hello');
  });

  it('throws when value is empty', () => {
    expect(() => WordId.create('')).toThrow('WordId cannot be empty');
  });

  it('throws when value is only whitespace', () => {
    expect(() => WordId.create('   ')).toThrow('WordId cannot be empty');
  });

  it('generates a random UUID-based id', () => {
    const id = WordId.generate();
    expect(id.getValue()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('generates distinct ids', () => {
    expect(WordId.generate().getValue()).not.toBe(WordId.generate().getValue());
  });

  it('compares equality by value (case-insensitive)', () => {
    expect(WordId.create('Word').equals(WordId.create('word'))).toBe(true);
    expect(WordId.create('a').equals(WordId.create('b'))).toBe(false);
  });
});
