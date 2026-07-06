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
      schema: { tags: ['User'], security: [{ bearerAuth: [] }] },
      preHandler: [authMiddleware]
    },
    controller.getProfile.bind(controller)
  );

  fastify.get<{ Querystring: { limit?: number } }>(
    '/user/me/history',
    {
      schema: { tags: ['User'], security: [{ bearerAuth: [] }] },
      preHandler: [authMiddleware]
    },
    controller.getHistory.bind(controller)
  );
}
