import { describe, it, expect } from 'vitest';
import { buildPaginatedResult } from '@shared/types/PaginatedResult';

describe('buildPaginatedResult', () => {
  it('computes total pages and navigation flags for the first page', () => {
    const result = buildPaginatedResult(['a', 'b'], 25, 1, 10);
    expect(result).toEqual({
      results: ['a', 'b'],
      totalDocs: 25,
      page: 1,
      totalPages: 3,
      hasNext: true,
      hasPrev: false
    });
  });

  it('sets hasPrev true and hasNext false on the last page', () => {
    const result = buildPaginatedResult(['x'], 25, 3, 10);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(true);
  });

  it('always reports at least one page even with zero results', () => {
    const result = buildPaginatedResult([], 0, 1, 10);
    expect(result.totalPages).toBe(1);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(false);
  });

  it('rounds partial pages up', () => {
    expect(buildPaginatedResult([], 11, 1, 10).totalPages).toBe(2);
  });
});
