import { describe, it, expect, beforeEach } from 'vitest';
import { GetUserQueryHandler } from '@core/application/queries/users/GetUserQueryHandler';
import { GetUserQuery } from '@core/application/queries/users/GetUserQuery';
import { User } from '@core/domain/entities/User';
import { createUserRepositoryMock } from '../helpers/mocks';

describe('GetUserQueryHandler', () => {
  let userRepository: ReturnType<typeof createUserRepositoryMock>;
  let handler: GetUserQueryHandler;

  beforeEach(() => {
    userRepository = createUserRepositoryMock();
    handler = new GetUserQueryHandler(userRepository);
  });

  it('returns the user view for an existing user', async () => {
    const created = new Date('2024-01-01T00:00:00Z');
    const user = User.reconstitute(
      'u1',
      'Alice',
      'alice@example.com',
      '$argon2id$hash',
      ['apple'],
      created
    );
    (userRepository.findById as any).mockResolvedValue(user);

    const result = await handler.handle(new GetUserQuery('u1'));

    expect(result).toEqual({
      id: 'u1',
      name: 'Alice',
      email: 'alice@example.com',
      favorites: ['apple'],
      createdAt: created
    });
  });

  it('throws when the user is not found', async () => {
    (userRepository.findById as any).mockResolvedValue(null);
    await expect(handler.handle(new GetUserQuery('missing'))).rejects.toThrow(
      'User not found'
    );
  });
});
