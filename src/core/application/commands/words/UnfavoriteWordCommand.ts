import { Command } from '../interfaces/Command';

export class UnfavoriteWordCommand implements Command {
  public readonly commandId: string;
  public readonly occurredOn: Date;

  constructor(
    public readonly userId: string,
    public readonly word: string
  ) {
    this.commandId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}
