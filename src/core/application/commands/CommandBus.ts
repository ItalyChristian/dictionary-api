import { Command } from './interfaces/Command';
import { CommandHandler } from './interfaces/CommandHandler';

export class CommandBus {
  private handlers: Map<string, CommandHandler<any, any>> = new Map();

  register<TCommand extends Command, TResult>(
    commandType: string,
    handler: CommandHandler<TCommand, TResult>
  ): void {
    this.handlers.set(commandType, handler);
  }

  async execute<TCommand extends Command, TResult = void>(
    command: TCommand
  ): Promise<TResult> {
    const handler = this.handlers.get(command.constructor.name);
    if (!handler) {
      throw new Error(`No handler registered for command ${command.constructor.name}`);
    }
    return await handler.handle(command);
  }
}