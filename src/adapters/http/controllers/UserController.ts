import { FastifyRequest, FastifyReply } from 'fastify';
import { QueryBus } from '../../../core/application/queries/QueryBus';
import { GetUserQuery } from '../../../core/application/queries/users/GetUserQuery';
import { GetHistoryQuery } from '../../../core/application/queries/words/GetHistoryQuery';
import { UserView } from '../../../core/application/queries/users/types/UserView';
import { PaginatedHistoryView } from '../../../core/application/queries/words/types/HistoryView';

export class UserController {
  constructor(private readonly queryBus: QueryBus) {}

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user.id;
      const query = new GetUserQuery(userId);

      const user = await this.queryBus.execute<GetUserQuery, UserView>(query);

      return reply.send(user);
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : 'Error fetching profile'
      });
    }
  }

  async getHistory(
    request: FastifyRequest<{ Querystring: { page?: number; limit?: number } }>,
    reply: FastifyReply
  ) {
    try {
      const userId = (request as any).user.id;
      const page = Number(request.query.page ?? 1);
      const limit = Number(request.query.limit ?? 20);
      const query = new GetHistoryQuery(userId, page, limit);

      const result = await this.queryBus.execute<
        GetHistoryQuery,
        PaginatedHistoryView
      >(query);

      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : 'Error fetching history'
      });
    }
  }
}
