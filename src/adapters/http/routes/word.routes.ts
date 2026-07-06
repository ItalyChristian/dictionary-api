import { FastifyInstance } from 'fastify';
import { WordController } from '../controllers/WordController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { rateLimitMiddleware } from '../middlewares/rate-limit.middleware';

export async function wordRoutes(
  fastify: FastifyInstance,
  controller: WordController
) {
  fastify.get<{
    Querystring: { search?: string; limit?: string; cursor?: string };
  }>(
    '/entries/en',
    {
      schema: {
        tags: ['Word'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            search: { type: 'string' },
            limit: { type: 'string' },
            cursor: { type: 'string' }
          }
        }
      },
      preHandler: [authMiddleware, rateLimitMiddleware({ limit: 100, window: 60000 })]
    },
    controller.listWords.bind(controller)
  );

  fastify.get<{ Params: { word: string } }>(
    '/entries/en/:word',
    {
      schema: { tags: ['Word'], security: [{ bearerAuth: [] }] },
      preHandler: [authMiddleware, rateLimitMiddleware({ limit: 100, window: 60000 })]
    },
    controller.getWord.bind(controller)
  );

  fastify.post<{ Params: { word: string } }>(
    '/entries/en/:word/favorite',
    {
      schema: { tags: ['Word'], security: [{ bearerAuth: [] }] },
      preHandler: [authMiddleware, rateLimitMiddleware({ limit: 30, window: 60000 })]
    },
    controller.favoriteWord.bind(controller)
  );

  fastify.delete<{ Params: { word: string } }>(
    '/entries/en/:word/unfavorite',
    {
      schema: { tags: ['Word'], security: [{ bearerAuth: [] }] },
      preHandler: [authMiddleware, rateLimitMiddleware({ limit: 30, window: 60000 })]
    },
    controller.unfavoriteWord.bind(controller)
  );

  fastify.get<{ Querystring: { page?: number; limit?: number } }>(
    '/user/me/favorites',
    {
      schema: { tags: ['User'], security: [{ bearerAuth: [] }] },
      preHandler: [authMiddleware]
    },
    controller.getFavorites.bind(controller)
  );
}