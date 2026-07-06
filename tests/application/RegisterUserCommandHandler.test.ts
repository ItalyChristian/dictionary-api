import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { RegisterUserCommandHandler } from '@core/application/commands/users/RegisterUserCommandHandler';
import { RegisterUserCommand } from '@core/application/commands/users/RegisterUserCommand';
import { UserRegisteredEvent } from '@core/domain/events/UserRegisteredEvent';
import { User } from '@core/domain/entities/User';
import {
  createUserRepositoryMock,
  createEventBusMock
} from '../helpers/mocks';

const JWT_SECRET = 'test-secret';

describe('RegisterUserCommandHandler', () => {
  let userRepository: ReturnType<typeof createUserRepositoryMock>;
  let eventBus: ReturnType<typeof createEventBusMock>;
  let handler: RegisterUserCommandHandler;

  beforeEach(() => {
    userRepository = createUserRepositoryMock();
    eventBus = createEventBusMock();
    handler = new RegisterUserCommandHandler(
      userRepository,
      eventBus,
      JWT_SECRET,
      3600
    );
  });

  it('registers a new user, persists it and returns a valid token', async () => {
    const command = new RegisterUserCommand(
      'Alice',
      'alice@example.com',
      'secret1!'
    );

    const result = await handler.handle(command);

    expect(result.name).toBe('Alice');
    expect(result.id).toBeTruthy();

    const decoded = jwt.verify(result.token, JWT_SECRET) as {
      id: string;
      email: string;
    };
    expect(decoded.id).toBe(result.id);
    expect(decoded.email).toBe('alice@example.com');

    expect(userRepository.save).toHaveBeenCalledOnce();
    const savedUser = (userRepository.save as any).mock.calls[0][0] as User;
    expect(savedUser.getPassword().startsWith('$argon2')).toBe(true);
  });

  it('publishes the UserRegisteredEvent', async () => {
    await handler.handle(
      new RegisterUserCommand('Alice', 'alice@example.com', 'secret1!')
    );

    expect(eventBus.publish).toHaveBeenCalledOnce();
    const published = (eventBus.publish as any).mock.calls[0][0];
    expect(published).toBeInstanceOf(UserRegisteredEvent);
  });

  it('throws when a user with the same email already exists', async () => {
    (userRepository.exists as any).mockResolvedValue(true);

    await expect(
      handler.handle(
        new RegisterUserCommand('Alice', 'alice@example.com', 'secret1!')
      )
    ).rejects.toThrow('User already exists with this email');

    expect(userRepository.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('propagates domain validation errors (weak password)', async () => {
    await expect(
      handler.handle(new RegisterUserCommand('Alice', 'alice@example.com', 'weak'))
    ).rejects.toThrow();
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
