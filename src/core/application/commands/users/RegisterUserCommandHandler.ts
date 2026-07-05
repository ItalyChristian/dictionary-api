import { CommandHandler } from '../interfaces/CommandHandler';
import { RegisterUserCommand } from './RegisterUserCommand';
import { User } from '../../../domain/entities/User';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { EventBusPort } from '../../../ports/event-bus/EventBusPort';
import { UserRegisteredEvent } from '../../../domain/events/UserRegisteredEvent';

export class RegisterUserCommandHandler
  implements CommandHandler<RegisterUserCommand, { userId: string }>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBusPort
  ) {}

  async handle(command: RegisterUserCommand): Promise<{ userId: string }> {
    const exists = await this.userRepository.exists(command.email);

    if (exists) {
      throw new Error('User already exists with this email');
    }

    const user = User.create(command.email, command.password);
    await user.hashPassword();

    await this.userRepository.save(user);

    const events = user.getEvents();
    const registeredEvent = events.find(
      (event): event is UserRegisteredEvent => event instanceof UserRegisteredEvent
    );

    if (registeredEvent) {
      await this.eventBus.publish(registeredEvent);
    }

    for (const event of events) {
      if (event !== registeredEvent) {
        await this.eventBus.publish(event);
      }
    }
    user.clearEvents();

    return { userId: user.getId() };
  }
}