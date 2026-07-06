export interface CachePort {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  invalidatePattern(pattern: string): Promise<void>;
  getTTL(key: string): Promise<number | null>;

  increment(key: string, windowSeconds: number): Promise<number>;
}