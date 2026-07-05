import { DomainEvent } from './DomainEvent';

export class WordUnfavoritedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventName = 'word.unfavorited';
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly userId: string,
    public readonly wordId: string,
    public readonly word: string
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}
