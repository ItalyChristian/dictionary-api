import { DomainEvent } from '../../domain/events/DomainEvent';

export interface EventBusPort {
  publish<T extends DomainEvent>(event: T): Promise<void>;
  publishMany<T extends DomainEvent>(events: T[]): Promise<void>;
  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: (event: T) => Promise<void>
  ): Promise<void>;
  unsubscribe(eventName: string, handlerId: string): Promise<void>;
}