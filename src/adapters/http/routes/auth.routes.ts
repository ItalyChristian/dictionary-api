import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController';
import { rateLimitMiddleware } from '../middlewares/rate-limit.middleware';
import { AuthBody } from '../types/AuthBody';

export async function authRoutes(
  fastify: FastifyInstance,
  controller: AuthController
) {
  fastify.post<{ Body: AuthBody }>(
    '/auth/signup',
    {
      schema: { tags: ['Auth'] },
      preHandler: [rateLimitMiddleware({ limit: 10, window: 60000 })]
    },
    controller.register.bind(controller)
  );

  fastify.post<{ Body: AuthBody }>(
    '/auth/signin',
    {
      schema: { tags: ['Auth'] },
      preHandler: [rateLimitMiddleware({ limit: 10, window: 60000 })]
    },
    controller.login.bind(controller)
  );
}
