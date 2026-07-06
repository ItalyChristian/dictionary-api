import pino, { Logger } from 'pino';
import { LoggerPort } from '../../core/ports/logger/LoggerPort';

export class PinoLogger implements LoggerPort {
  private readonly logger: Logger;

  constructor(logger?: Logger) {
    this.logger =
      logger ??
      pino({
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname'
                }
              }
            : undefined
      });
  }

  info(message: string, meta?: unknown): void {
    this.logger.info(meta ?? {}, message);
  }

  warn(message: string, meta?: unknown): void {
    this.logger.warn(meta ?? {}, message);
  }

  error(message: string, error?: unknown): void {
    if (error instanceof Error) {
      this.logger.error({ err: error }, message);
    } else {
      this.logger.error(error ?? {}, message);
    }
  }

  debug(message: string, meta?: unknown): void {
    this.logger.debug(meta ?? {}, message);
  }
}
