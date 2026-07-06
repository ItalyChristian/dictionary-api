import { CommandBus } from '../../core/application/commands/CommandBus';
import { QueryBus } from '../../core/application/queries/QueryBus';
import { UserRepository } from '../../core/domain/repositories/UserRepository';
import { WordRepository } from '../../core/domain/repositories/WordRepository';
import { HistoryRepository } from '../../core/domain/repositories/HistoryRepository';
import { CachePort } from '../../core/ports/cache/CachePort';
import { EventBusPort } from '../../core/ports/event-bus/EventBusPort';
import { DictionaryApiPort } from '../../core/ports/api/DictionaryApiPort';
import { LoggerPort } from '../../core/ports/logger/LoggerPort';

import { PostgresUserRepository } from '../repositories/PostgresUserRepository';
import { PostgresWordRepository } from '../repositories/PostgresWordRepository';
import { PostgresHistoryRepository } from '../repositories/PostgresHistoryRepository';
import { RedisCache } from '../cache/RedisCache';
import { RabbitMQEventBus } from '../event-bus/RabbitMQEventBus';
import { FreeDictionaryApi } from '../api/FreeDictionaryApi';
import { PinoLogger } from '../logger/PinoLogger';

import { RegisterUserCommandHandler } from '../../core/application/commands/users/RegisterUserCommandHandler';
import { LoginUserCommandHandler } from '../../core/application/commands/users/LoginUserCommandHandler';
import { FavoriteWordCommandHandler } from '../../core/application/commands/words/FavoriteWordCommandHandler';
import { UnfavoriteWordCommandHandler } from '../../core/application/commands/words/UnfavoriteWordCommandHandler';

import { GetWordQueryHandler } from '../../core/application/queries/words/GetWordQueryHandler';
import { GetUserQueryHandler } from '../../core/application/queries/users/GetUserQueryHandler';
import { GetFavoritesQueryHandler } from '../../core/application/queries/words/GetFavoritesQueryHandler';
import { GetHistoryQueryHandler } from '../../core/application/queries/words/GetHistoryQueryHandler';

import { OnWordViewedHandler } from '../../core/application/event-handlers/OnWordViewedHandler';
import { OnWordFavoritedHandler } from '../../core/application/event-handlers/OnWordFavoritedHandler';

export class DIContainer {
  private static instance: DIContainer;
  private container: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  register(key: string, value: any): void {
    this.container.set(key, value);
  }

  get<T>(key: string): T {
    const instance = this.container.get(key);
    if (!instance) {
      throw new Error(`Dependency ${key} not found`);
    }
    return instance as T;
  }

  async setup(): Promise<void> {
    const logger: LoggerPort = new PinoLogger();
    this.register('logger', logger);

    const cache: CachePort = new RedisCache(process.env.REDIS_URL!, logger);
    this.register('cache', cache);

    const rabbitEventBus = new RabbitMQEventBus(process.env.RABBITMQ_URL!, logger);
    await rabbitEventBus.connect();
    const eventBus: EventBusPort = rabbitEventBus;
    this.register('eventBus', eventBus);

    const userRepository: UserRepository = new PostgresUserRepository();
    this.register('userRepository', userRepository);

    const wordRepository: WordRepository = new PostgresWordRepository();
    this.register('wordRepository', wordRepository);

    const historyRepository: HistoryRepository = new PostgresHistoryRepository();
    this.register('historyRepository', historyRepository);

    const dictionaryApi: DictionaryApiPort = new FreeDictionaryApi(
      process.env.DICTIONARY_API_URL!
    );
    this.register('dictionaryApi', dictionaryApi);

    const commandBus = new CommandBus();
    this.register('commandBus', commandBus);

    const queryBus = new QueryBus();
    this.register('queryBus', queryBus);

    commandBus.register(
      'RegisterUserCommand',
      new RegisterUserCommandHandler(userRepository, eventBus, process.env.JWT_SECRET!)
    );

    commandBus.register(
      'LoginUserCommand',
      new LoginUserCommandHandler(userRepository, process.env.JWT_SECRET!)
    );

    commandBus.register(
      'FavoriteWordCommand',
      new FavoriteWordCommandHandler(userRepository, wordRepository, eventBus)
    );

    commandBus.register(
      'UnfavoriteWordCommand',
      new UnfavoriteWordCommandHandler(userRepository, wordRepository, eventBus)
    );

    queryBus.register(
      'GetWordQuery',
      new GetWordQueryHandler(
        wordRepository,
        userRepository,
        cache,
        dictionaryApi,
        eventBus
      )
    );

    queryBus.register(
      'GetUserQuery',
      new GetUserQueryHandler(userRepository)
    );

    queryBus.register(
      'GetFavoritesQuery',
      new GetFavoritesQueryHandler(userRepository)
    );

    queryBus.register(
      'GetHistoryQuery',
      new GetHistoryQueryHandler(historyRepository)
    );

    const onWordViewedHandler = new OnWordViewedHandler(historyRepository);
    await eventBus.subscribe(
      'word.viewed',
      onWordViewedHandler.handle.bind(onWordViewedHandler)
    );

    const onWordFavoritedHandler = new OnWordFavoritedHandler(logger, cache);
    await eventBus.subscribe(
      'word.favorited',
      onWordFavoritedHandler.handle.bind(onWordFavoritedHandler)
    );

    logger.info('Dependency Injection container setup complete');
  }

  async shutdown(): Promise<void> {
    const cache = this.get<RedisCache>('cache');
    await cache.close();

    const eventBus = this.get<RabbitMQEventBus>('eventBus');
    await eventBus.close();
  }
}