import { FastifyRequest, FastifyReply } from 'fastify';
import { CommandBus } from '../../../core/application/commands/CommandBus';
import { QueryBus } from '../../../core/application/queries/QueryBus';
import { FavoriteWordCommand } from '../../../core/application/commands/words/FavoriteWordCommand';
import { UnfavoriteWordCommand } from '../../../core/application/commands/words/UnfavoriteWordCommand';
import { GetWordQuery } from '../../../core/application/queries/words/GetWordQuery';
import { GetWordsQuery } from '../../../core/application/queries/words/GetWordsQuery';
import { GetFavoritesQuery } from '../../../core/application/queries/words/GetFavoritesQuery';
import { PaginatedFavoriteView } from '../../../core/application/queries/words/types/FavoriteView';
import { GetWordsResult } from '../../../core/application/queries/words/types/WordListView';

export class WordController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  async getWord(request: FastifyRequest<{ Params: { word: string } }>, reply: FastifyReply) {
    const startTime = Date.now();
    
    try {
      const userId = (request as any).user?.id;
      const query = new GetWordQuery(request.params.word, userId);

      const result = await this.queryBus.execute<
        GetWordQuery,
        { word: string; details: any; isFavorite: boolean; fromCache: boolean }
      >(query);

      return reply
        .header('x-cache', result.fromCache ? 'HIT' : 'MISS')
        .header('x-response-time', Date.now() - startTime)
        .send(result);
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : 'Error fetching word'
      });
    }
  }

  async listWords(
    request: FastifyRequest<{
      Querystring: { search?: string; limit?: string; cursor?: string };
    }>,
    reply: FastifyReply
  ) {
    const startTime = Date.now();

    try {
      const rawLimit = Number(request.query.limit ?? 10);
      const limit = Number.isFinite(rawLimit)
        ? Math.min(Math.max(Math.trunc(rawLimit), 1), 100)
        : 10;

      const query = new GetWordsQuery(
        request.query.search,
        limit,
        request.query.cursor
      );

      const { data, fromCache } = await this.queryBus.execute<
        GetWordsQuery,
        GetWordsResult
      >(query);

      return reply
        .header('x-cache', fromCache ? 'HIT' : 'MISS')
        .header('x-response-time', `${Date.now() - startTime}`)
        .send(data);
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : 'Error listing words'
      });
    }
  }

  async favoriteWord(request: FastifyRequest<{ Params: { word: string } }>, reply: FastifyReply) {
    try {
      const userId = (request as any).user.id;
      const command = new FavoriteWordCommand(userId, request.params.word);
      
      await this.commandBus.execute(command);

      return reply.status(200).send({ message: 'success' });
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : 'Error favoriting word'
      });
    }
  }

  async unfavoriteWord(request: FastifyRequest<{ Params: { word: string } }>, reply: FastifyReply) {
    try {
      const userId = (request as any).user.id;
      const command = new UnfavoriteWordCommand(userId, request.params.word);
      
      await this.commandBus.execute(command);

      return reply.status(200).send({ message: 'success' });
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : 'Error unfavoriting word'
      });
    }
  }

  async getFavorites(
    request: FastifyRequest<{ Querystring: { page?: number; limit?: number } }>,
    reply: FastifyReply
  ) {
    try {
      const userId = (request as any).user.id;
      const page = Number(request.query.page ?? 1);
      const limit = Number(request.query.limit ?? 20);
      const query = new GetFavoritesQuery(userId, page, limit);

      const favorites = await this.queryBus.execute<
        GetFavoritesQuery,
        PaginatedFavoriteView
      >(query);

      return reply.send(favorites);
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : 'Error fetching favorites'
      });
    }
  }
}