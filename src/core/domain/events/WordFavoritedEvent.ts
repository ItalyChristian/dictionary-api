import { DomainEvent } from './DomainEvent';

export class WordFavoritedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventName = 'word.favorited';
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