export interface PaginatedResult<T> {
  results: T[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function buildPaginatedResult<T>(
  results: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    results,
    totalDocs: total,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}
