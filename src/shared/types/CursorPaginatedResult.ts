export interface CursorPaginatedResult<T> {
  results: T[];
  totalDocs: number;
  previous: string | null;
  next: string | null;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CursorPayload {
  w: string;
  d: 'next' | 'prev';
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeCursor(token: string): CursorPayload | undefined {
  try {
    const parsed = JSON.parse(
      Buffer.from(token, 'base64url').toString('utf-8')
    );

    if (
      parsed &&
      typeof parsed.w === 'string' &&
      (parsed.d === 'next' || parsed.d === 'prev')
    ) {
      return parsed as CursorPayload;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

export function buildCursorResult<T>(params: {
  results: T[];
  totalDocs: number;
  firstKey: string | null;
  lastKey: string | null;
  hasNext: boolean;
  hasPrev: boolean;
}): CursorPaginatedResult<T> {
  const { results, totalDocs, firstKey, lastKey, hasNext, hasPrev } = params;

  return {
    results,
    totalDocs,
    previous:
      hasPrev && firstKey ? encodeCursor({ w: firstKey, d: 'prev' }) : null,
    next: hasNext && lastKey ? encodeCursor({ w: lastKey, d: 'next' }) : null,
    hasNext,
    hasPrev
  };
}
