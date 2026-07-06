import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController';
import { rateLimitMiddleware } from '../middlewares/rate-limit.middleware';
import { AuthBody, RegisterBody } from '../types/AuthBody';

const authResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', example: 'f3a106sa65dv53ab2c1380acef' },
    name: { type: 'string', example: 'User 1' },
    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.JWT.Token' }
  }
};

const errorResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' }
  }
};

export async function authRoutes(
  fastify: FastifyInstance,
  controller: AuthController
) {
  fastify.post<{ Body: RegisterBody }>(
    '/auth/signup',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Registra um novo usuário e retorna o token de acesso',
        body: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'User 1' },
            email: { type: 'string', format: 'email', example: 'example@email.com' },
            password: {
              type: 'string',
              minLength: 6,
              description:
                'Mínimo de 6 caracteres, com ao menos um número e um caractere especial',
              example: 'Test@123'
            }
          }
        },
        response: {
          200: authResponseSchema,
          400: errorResponseSchema
        }
      },
      preHandler: [rateLimitMiddleware({ limit: 10, window: 60000 })]
    },
    controller.register.bind(controller)
  );

  fastify.post<{ Body: AuthBody }>(
    '/auth/signin',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Autentica um usuário e retorna o token de acesso',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'example@email.com' },
            password: {
              type: 'string',
              minLength: 6,
              description:
                'Mínimo de 6 caracteres, com ao menos um número e um caractere especial',
              example: 'Test@123'
            }
          }
        },
        response: {
          200: authResponseSchema,
          401: errorResponseSchema
        }
      },
      preHandler: [rateLimitMiddleware({ limit: 10, window: 60000 })]
    },
    controller.login.bind(controller)
  );
}
