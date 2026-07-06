import amqp from 'amqplib';
import type { Channel, ChannelModel } from 'amqplib';
import { EventBusPort } from '../../core/ports/event-bus/EventBusPort';
import { DomainEvent } from '../../core/domain/events/types/DomainEvent';
import { LoggerPort } from '../../core/ports/logger/LoggerPort';

interface EventSubscription {
  handler: (event: any) => Promise<void>;
  queue: string;
}

export class RabbitMQEventBus implements EventBusPort {
  private connection!: ChannelModel;
  private channel!: Channel;
  private subscriptions: Map<string, Map<string, EventSubscription>> = new Map();
  private readonly exchangeName = 'domain_events';

  constructor(
    private readonly url: string,
    private readonly logger: LoggerPort
  ) {}

  async connect(): Promise<void> {
    this.connection = await amqp.connect(this.url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(this.exchangeName, 'topic', {
      durable: true
    });

    this.logger.info('RabbitMQ connected successfully');
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    try {
      const routingKey = event.eventName;

      await this.channel.publish(
        this.exchangeName,
        routingKey,
        Buffer.from(JSON.stringify({
          ...event,
          occurredOn: event.occurredOn.toISOString()
        })),
        { persistent: true }
      );

      this.logger.debug(`Event published: ${event.eventName}`, {
        eventId: event.eventId,
        routingKey
      });
    } catch (error) {
      this.logger.error('Error publishing event:', error);
      throw error;
    }
  }

  async publishMany<T extends DomainEvent>(events: T[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  async subscribe<T extends DomainEvent>(
    eventName: string,
    handler: (event: T) => Promise<void>
  ): Promise<void> {
    const queue = await this.channel.assertQueue('', { exclusive: true });
    await this.channel.bindQueue(queue.queue, this.exchangeName, eventName);

    const { consumerTag } = await this.channel.consume(queue.queue, async (msg: any) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          event.occurredOn = new Date(event.occurredOn);

          await handler(event as T);
          this.channel.ack(msg);
        } catch (error) {
          this.logger.error(`Error handling event ${eventName}:`, error);
          this.channel.nack(msg, false, true);
        }
      }
    });

    if (!this.subscriptions.has(eventName)) {
      this.subscriptions.set(eventName, new Map());
    }
    this.subscriptions.get(eventName)!.set(consumerTag, {
      handler,
      queue: queue.queue
    });

    this.logger.info(`Subscribed to event: ${eventName}`, {
      handlerId: consumerTag
    });
  }

  async unsubscribe(eventName: string, handlerId: string): Promise<void> {
    const eventSubscriptions = this.subscriptions.get(eventName);
    const subscription = eventSubscriptions?.get(handlerId);

    if (!subscription) {
      this.logger.warn(
        `No subscription found for event ${eventName} with handler ${handlerId}`
      );
      return;
    }

    try {
      await this.channel.cancel(handlerId);
      await this.channel.deleteQueue(subscription.queue);

      eventSubscriptions!.delete(handlerId);
      if (eventSubscriptions!.size === 0) {
        this.subscriptions.delete(eventName);
      }

      this.logger.info(`Unsubscribed from event: ${eventName}`, {
        handlerId
      });
    } catch (error) {
      this.logger.error(`Error unsubscribing from event ${eventName}:`, error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.channel.close();
    await this.connection.close();
  }
}