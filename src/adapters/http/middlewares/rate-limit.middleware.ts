import { FastifyRequest, FastifyReply } from 'fastify';
import { CachePort } from '../../../core/ports/cache/CachePort';

interface RateLimitOptions {
  limit: number;
  window: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

let cache: CachePort | null = null;
const memoryStore = new Map<string, RateLimitEntry>();

export function configureRateLimiter(cachePort: CachePort): void {
  cache = cachePort;
}

export function rateLimitMiddleware(options: RateLimitOptions) {
  const { limit, window } = options;
  const windowSeconds = Math.ceil(window / 1000);

  return async function (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const routeKey = request.routeOptions?.url ?? request.url;
    const key = `ratelimit:${routeKey}:${request.ip}`;
    const now = Date.now();

    let count: number;
    let resetAt: number;

    if (cache) {
      count = await cache.increment(key, windowSeconds);
      const ttl = await cache.getTTL(key);
      resetAt = now + (ttl && ttl > 0 ? ttl * 1000 : window);
    } else {
      let entry = memoryStore.get(key);
      if (!entry || entry.resetAt <= now) {
        entry = { count: 0, resetAt: now + window };
        memoryStore.set(key, entry);
      }
      entry.count++;
      count = entry.count;
      resetAt = entry.resetAt;
    }

    const remaining = Math.max(0, limit - count);
    reply.header('x-ratelimit-limit', limit);
    reply.header('x-ratelimit-remaining', remaining);
    reply.header('x-ratelimit-reset', Math.ceil(resetAt / 1000));

    if (count > limit) {
      const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000));
      reply.header('retry-after', retryAfter);
      return reply.status(429).send({ message: 'Too many requests' });
    }
  };
}
