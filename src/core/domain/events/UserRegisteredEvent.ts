import { DomainEvent } from './types/DomainEvent';

export class UserRegisteredEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventName = 'user.registered';
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly name: string,
    public readonly email: string
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}