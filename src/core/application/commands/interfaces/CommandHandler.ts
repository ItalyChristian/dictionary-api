import { Command } from "./Command";

export interface CommandHandler<TCommand extends Command, TResult = void> {
  handle(command: TCommand): Promise<TResult>;
}