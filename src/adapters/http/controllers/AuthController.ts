import { FastifyRequest, FastifyReply } from 'fastify';
import { CommandBus } from '../../../core/application/commands/CommandBus';
import { RegisterUserCommand } from '../../../core/application/commands/users/RegisterUserCommand';
import { RegisterResult, LoginResult } from '../../../core/application/commands/users/types';
import { LoginUserCommand } from '../../../core/application/commands/users/LoginUserCommand';
import { AuthBody, RegisterBody } from '../types/AuthBody';

export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  async register(
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply
  ) {
    try {
      const { name, email, password } = request.body;
      const command = new RegisterUserCommand(name, email, password);

      const result = await this.commandBus.execute<
        RegisterUserCommand,
        RegisterResult
      >(command);

      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : 'Error registering user'
      });
    }
  }

  async login(request: FastifyRequest<{ Body: AuthBody }>, reply: FastifyReply) {
    try {
      const { email, password } = request.body;
      const command = new LoginUserCommand(email, password);

      const result = await this.commandBus.execute<LoginUserCommand, LoginResult>(
        command
      );

      return reply.send(result);
    } catch (error) {
      return reply.status(401).send({
        message: error instanceof Error ? error.message : 'Error logging in'
      });
    }
  }
}
