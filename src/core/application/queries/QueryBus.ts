import { Query } from './interfaces/Query';
import { QueryHandler } from './interfaces/QueryHandler';

export class QueryBus {
  private handlers: Map<string, QueryHandler<any, any>> = new Map();

  register<TQuery extends Query, TResult>(
    queryType: string,
    handler: QueryHandler<TQuery, TResult>
  ): void {
    this.handlers.set(queryType, handler);
  }

  async execute<TQuery extends Query, TResult>(
    query: TQuery
  ): Promise<TResult> {
    const handler = this.handlers.get(query.constructor.name);
    if (!handler) {
      throw new Error(`No handler registered for query ${query.constructor.name}`);
    }
    return await handler.handle(query);
  }
}