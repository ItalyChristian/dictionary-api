import { describe, it, expect } from 'vitest';
import {
  encodeCursor,
  decodeCursor,
  buildCursorResult
} from '@shared/types/CursorPaginatedResult';

describe('CursorPaginatedResult', () => {
  describe('encode / decode', () => {
    it('round-trips a cursor payload', () => {
      const token = encodeCursor({ w: 'apple', d: 'next' });
      expect(decodeCursor(token)).toEqual({ w: 'apple', d: 'next' });
    });

    it('produces url-safe base64 (no +, /, or =)', () => {
      const token = encodeCursor({ w: 'a-word-with-lots-of-chars????', d: 'prev' });
      expect(token).not.toMatch(/[+/=]/);
    });

    it('returns undefined for malformed tokens', () => {
      expect(decodeCursor('not-base64-$$$')).toBeUndefined();
    });

    it('returns undefined when the payload shape is invalid', () => {
      const bad = Buffer.from(JSON.stringify({ w: 'apple', d: 'sideways' })).toString(
        'base64url'
      );
      expect(decodeCursor(bad)).toBeUndefined();
    });

    it('returns undefined when w is missing', () => {
      const bad = Buffer.from(JSON.stringify({ d: 'next' })).toString('base64url');
      expect(decodeCursor(bad)).toBeUndefined();
    });
  });

  describe('buildCursorResult', () => {
    it('builds next and previous cursors when navigation is possible', () => {
      const result = buildCursorResult<string>({
        results: ['b', 'c'],
        totalDocs: 5,
        firstKey: 'b',
        lastKey: 'c',
        hasNext: true,
        hasPrev: true
      });

      expect(result.results).toEqual(['b', 'c']);
      expect(result.totalDocs).toBe(5);
      expect(decodeCursor(result.next!)).toEqual({ w: 'c', d: 'next' });
      expect(decodeCursor(result.previous!)).toEqual({ w: 'b', d: 'prev' });
    });

    it('nulls cursors when there is no next/prev page', () => {
      const result = buildCursorResult<string>({
        results: ['a'],
        totalDocs: 1,
        firstKey: 'a',
        lastKey: 'a',
        hasNext: false,
        hasPrev: false
      });
      expect(result.next).toBeNull();
      expect(result.previous).toBeNull();
    });

    it('nulls the cursor when the corresponding key is missing', () => {
      const result = buildCursorResult<string>({
        results: [],
        totalDocs: 0,
        firstKey: null,
        lastKey: null,
        hasNext: true,
        hasPrev: true
      });
      expect(result.next).toBeNull();
      expect(result.previous).toBeNull();
    });
  });
});
