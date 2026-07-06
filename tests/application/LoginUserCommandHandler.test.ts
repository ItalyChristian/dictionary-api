import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { LoginUserCommandHandler } from '@core/application/commands/users/LoginUserCommandHandler';
import { LoginUserCommand } from '@core/application/commands/users/LoginUserCommand';
import { User } from '@core/domain/entities/User';
import { createUserRepositoryMock } from '../helpers/mocks';

const JWT_SECRET = 'test-secret';

async function buildUser(
  email = 'alice@example.com',
  password = 'secret1!'
): Promise<User> {
  const user = User.create('Alice', email, password);
  await user.hashPassword();
  return User.reconstitute(
    user.getId(),
    user.getName(),
    user.getEmail(),
    user.getPassword(),
    [],
    user.getCreatedAt()
  );
}

describe('LoginUserCommandHandler', () => {
  let userRepository: ReturnType<typeof createUserRepositoryMock>;
  let handler: LoginUserCommandHandler;

  beforeEach(() => {
    userRepository = createUserRepositoryMock();
    handler = new LoginUserCommandHandler(userRepository, JWT_SECRET, 3600);
  });

  it('logs in with valid credentials and returns a token', async () => {
    const user = await buildUser();
    (userRepository.findByEmail as any).mockResolvedValue(user);

    const result = await handler.handle(
      new LoginUserCommand('alice@example.com', 'secret1!')
    );

    expect(result.id).toBe(user.getId());
    expect(result.name).toBe('Alice');
    const decoded = jwt.verify(result.token, JWT_SECRET) as { id: string };
    expect(decoded.id).toBe(user.getId());
  });

  it('throws Invalid credentials when the user does not exist', async () => {
    (userRepository.findByEmail as any).mockResolvedValue(null);

    await expect(
      handler.handle(new LoginUserCommand('ghost@example.com', 'secret1!'))
    ).rejects.toThrow('Invalid credentials');
  });

  it('throws Invalid credentials when the password is wrong', async () => {
    const user = await buildUser();
    (userRepository.findByEmail as any).mockResolvedValue(user);

    await expect(
      handler.handle(new LoginUserCommand('alice@example.com', 'wrong1!'))
    ).rejects.toThrow('Invalid credentials');
  });
});
