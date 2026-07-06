import { FastifyRequest, FastifyReply } from 'fastify';
import { CommandBus } from '../../../core/application/commands/CommandBus';
import { QueryBus } from '../../../core/application/queries/QueryBus';
import { FavoriteWordCommand } from '../../../core/application/commands/words/FavoriteWordCommand';
import { UnfavoriteWordCommand } from '../../../core/application/commands/words/UnfavoriteWordCommand';
import { GetWordQuery } from '../../../core/application/queries/words/GetWordQuery';
import { GetFavoritesQuery } from '../../../core/application/queries/words/GetFavoritesQuery';

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
        { word: string; details: any; isFavorite: boolean }
      >(query);

      return reply
        .header('x-cache', result.details.fromCache ? 'HIT' : 'MISS')
        .header('x-response-time', Date.now() - startTime)
        .send(result);
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : 'Error fetching word'
      });
    }
  }

  async favoriteWord(request: FastifyRequest<{ Params: { word: string } }>, reply: FastifyReply) {
    try {
      const userId = (request as any).user.id;
      const command = new FavoriteWordCommand(userId, request.params.word);
      
      await this.commandBus.execute(command);
      
      return reply.status(204).send();
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
      
      return reply.status(204).send();
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : 'Error unfavoriting word'
      });
    }
  }

  async getFavorites(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user.id;
      const query = new GetFavoritesQuery(userId);
      
      const favorites = await this.queryBus.execute(query);
      
      return reply.send(favorites);
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : 'Error fetching favorites'
      });
    }
  }
}