import { FastifyInstance } from 'fastify';
import { WordController } from '../controllers/WordController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { rateLimitMiddleware } from '../middlewares/rate-limit.middleware';

export async function wordRoutes(
  fastify: FastifyInstance,
  controller: WordController
) {
  fastify.get<{ Params: { word: string } }>(
    '/entries/en/:word',
    {
      preHandler: [rateLimitMiddleware({ limit: 100, window: 60000 })]
    },
    controller.getWord.bind(controller)
  );

  fastify.post<{ Params: { word: string } }>(
    '/entries/en/:word/favorite',
    {
      preHandler: [authMiddleware, rateLimitMiddleware({ limit: 30, window: 60000 })]
    },
    controller.favoriteWord.bind(controller)
  );

  fastify.delete<{ Params: { word: string } }>(
    '/entries/en/:word/unfavorite',
    {
      preHandler: [authMiddleware, rateLimitMiddleware({ limit: 30, window: 60000 })]
    },
    controller.unfavoriteWord.bind(controller)
  );

  fastify.get(
    '/user/me/favorites',
    {
      preHandler: [authMiddleware]
    },
    controller.getFavorites.bind(controller)
  );
}