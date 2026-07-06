import { Command } from '../interfaces/Command';

export class LoginUserCommand implements Command {
  public readonly commandId: string;
  public readonly occurredOn: Date;

  constructor(
    public readonly email: string,
    public readonly password: string
  ) {
    this.commandId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}
