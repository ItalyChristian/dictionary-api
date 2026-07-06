import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { DIContainer } from '../infrastructure/config/dependencies';
import { authRoutes } from './http/routes/auth.routes';
import { wordRoutes } from './http/routes/word.routes';
import { userRoutes } from './http/routes/user.routes';
import { AuthController } from './http/controllers/AuthController';
import { WordController } from './http/controllers/WordController';
import { UserController } from './http/controllers/UserController';
import { errorHandler } from './http/middlewares/error-handler.middleware';
import { loggingMiddleware } from './http/middlewares/logging.middleware';
import { metricsMiddleware } from './http/middlewares/metrics.middleware';
import { configureRateLimiter } from './http/middlewares/rate-limit.middleware';
import { CommandBus } from '../core/application/commands/CommandBus';
import { QueryBus } from '../core/application/queries/QueryBus';
import { CachePort } from '../core/ports/cache/CachePort';

async function buildServer() {
  const fastify = Fastify({
    logger: true,
    trustProxy: true,
    requestIdHeader: 'x-request-id'
  });

  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'Dictionary API',
        description: 'API com Hexagonal Architecture + DDD + Event-Driven',
        version: '1.0.0'
      },
      host: 'localhost:3333',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header'
        }
      }
    }
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs'
  });

  fastify.addHook('onRequest', loggingMiddleware);
  fastify.addHook('onRequest', metricsMiddleware);
  
  fastify.setErrorHandler(errorHandler);

  const di = DIContainer.getInstance();
  await di.setup();

  configureRateLimiter(di.get<CachePort>('cache'));

  const commandBus = di.get<CommandBus>('commandBus');
  const queryBus = di.get<QueryBus>('queryBus');

  const authController = new AuthController(commandBus);
  const wordController = new WordController(commandBus, queryBus);
  const userController = new UserController(queryBus);

  await authRoutes(fastify, authController);
  await wordRoutes(fastify, wordController);
  await userRoutes(fastify, userController);

  fastify.get('/health', async () => ({ status: 'healthy' }));
  fastify.get('/health/ready', async () => ({ status: 'ready' }));

  fastify.get('/', async () => ({
    name: 'Dictionary API',
    version: '1.0.0',
    documentation: '/docs'
  }));

  return fastify;
}

async function startServer() {
  try {
    const fastify = await buildServer();
    
    const port = Number(process.env.PORT) || 3333;
    await fastify.listen({ port, host: '0.0.0.0' });
    
    console.log(`Server running on port ${port}`);
    console.log(`Documentation: http://localhost:${port}/docs`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  const di = DIContainer.getInstance();
  await di.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  const di = DIContainer.getInstance();
  await di.shutdown();
  process.exit(0);
});

startServer();