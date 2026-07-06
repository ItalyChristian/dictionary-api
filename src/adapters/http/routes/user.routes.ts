import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth.middleware';

export async function userRoutes(
  fastify: FastifyInstance,
  controller: UserController
) {
  fastify.get(
    '/user/me',
    {
      preHandler: [authMiddleware]
    },
    controller.getProfile.bind(controller)
  );

  fastify.get<{ Querystring: { limit?: number } }>(
    '/user/me/history',
    {
      preHandler: [authMiddleware]
    },
    controller.getHistory.bind(controller)
  );
}
