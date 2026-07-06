import Redis from 'ioredis';
import { CachePort } from '../../core/ports/cache/CachePort';
import { LoggerPort } from '../../core/ports/logger/LoggerPort';

export class RedisCache implements CachePort {
  private readonly client: Redis;

  constructor(
    url: string,
    private readonly logger: LoggerPort
  ) {
    this.client = new Redis(url);
    
    this.client.on('error', (error) => {
      this.logger.error('Redis error:', error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        this.logger.debug(`Invalidated ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      this.logger.error(`Error invalidating pattern ${pattern}:`, error);
    }
  }

  async increment(key: string, windowSeconds: number): Promise<number> {
    try {
      const count = await this.client.incr(key);
      if (count === 1) {
        await this.client.expire(key, windowSeconds);
      }
      return count;
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}:`, error);

      return 0;
    }
  }

  async getTTL(key: string): Promise<number | null> {
    try {
      const ttl = await this.client.ttl(key);
      return ttl > 0 ? ttl : null;
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}:`, error);
      return null;
    }
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}