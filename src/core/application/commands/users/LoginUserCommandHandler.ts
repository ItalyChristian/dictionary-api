import jwt from 'jsonwebtoken';
import { CommandHandler } from '../interfaces/CommandHandler';
import { LoginUserCommand } from './LoginUserCommand';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { LoginResult } from './types';

export class LoginUserCommandHandler
  implements CommandHandler<LoginUserCommand, LoginResult>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSecret: string,
    private readonly jwtExpiresInSeconds: number = 86400
  ) {}

  async handle(command: LoginUserCommand): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const valid = await user.verifyPassword(command.password);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

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
