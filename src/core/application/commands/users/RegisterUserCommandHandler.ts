import jwt from 'jsonwebtoken';
import { CommandHandler } from '../interfaces/CommandHandler';
import { RegisterUserCommand } from './RegisterUserCommand';
import { User } from '../../../domain/entities/User';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { EventBusPort } from '../../../ports/event-bus/EventBusPort';
import { UserRegisteredEvent } from '../../../domain/events/UserRegisteredEvent';
import { RegisterResult } from './types';

export class RegisterUserCommandHandler
  implements CommandHandler<RegisterUserCommand, RegisterResult>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBusPort,
    private readonly jwtSecret: string,
    private readonly jwtExpiresInSeconds: number = 86400
  ) {}

  async handle(command: RegisterUserCommand): Promise<RegisterResult> {
    const exists = await this.userRepository.exists(command.email);

    if (exists) {
      throw new Error('User already exists with this email');
    }

    const user = User.create(command.name, command.email, command.password);
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

    const token = jwt.sign(
      { id: user.getId(), email: user.getEmail() },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresInSeconds }
    );

    return {
      id: user.getId(),
      name: user.getName(),
      token: `Bearer ${token}`
    };
  }
}
