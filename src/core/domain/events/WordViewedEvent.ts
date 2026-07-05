import { DomainEvent } from './DomainEvent';

export class WordViewedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventName = 'word.viewed';
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly userId: string,
    public readonly word: string,
    public readonly source: 'cache' | 'database' | 'api'
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}