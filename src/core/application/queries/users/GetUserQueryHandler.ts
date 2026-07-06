import { QueryHandler } from '../interfaces/QueryHandler';
import { GetUserQuery } from './GetUserQuery';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { UserView } from './types/UserView';

export class GetUserQueryHandler
  implements QueryHandler<GetUserQuery, UserView>
{
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  async handle(query: GetUserQuery): Promise<UserView> {
    const user = await this.userRepository.findById(query.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      favorites: user.getFavorites().map((wordId) => wordId.getValue()),
      createdAt: user.getCreatedAt()
    };
  }
}
