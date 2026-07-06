import { describe, it, expect, vi } from 'vitest';
import { QueryBus } from '@core/application/queries/QueryBus';
import type { Query } from '@core/application/queries/interfaces/Query';
import type { QueryHandler } from '@core/application/queries/interfaces/QueryHandler';

class SampleQuery implements Query {
  readonly queryId = 'q-1';
  readonly occurredOn = new Date(0);
}

describe('QueryBus', () => {
  it('dispatches a query to its registered handler', async () => {
    const bus = new QueryBus();
    const handler: QueryHandler<SampleQuery, number> = {
      handle: vi.fn().mockResolvedValue(42)
    };

    bus.register('SampleQuery', handler);
    const result = await bus.execute<SampleQuery, number>(new SampleQuery());

    expect(result).toBe(42);
    expect(handler.handle).toHaveBeenCalledOnce();
  });

  it('throws when no handler is registered', async () => {
    const bus = new QueryBus();
    await expect(bus.execute(new SampleQuery())).rejects.toThrow(
      'No handler registered for query SampleQuery'
    );
  });
});
