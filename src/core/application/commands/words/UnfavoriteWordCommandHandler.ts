import { CommandHandler } from '../interfaces/CommandHandler';
import { UnfavoriteWordCommand } from './UnfavoriteWordCommand';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { WordRepository } from '../../../domain/repositories/WordRepository';
import { EventBusPort } from '../../../ports/event-bus/EventBusPort';
import { WordId } from '../../../domain/value-objects/WordId';

export class UnfavoriteWordCommandHandler
  implements CommandHandler<UnfavoriteWordCommand, void>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly wordRepository: WordRepository,
    private readonly eventBus: EventBusPort
  ) {}

  async handle(command: UnfavoriteWordCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const word = await this.wordRepository.findByWord(command.word);
    if (!word) {
      throw new Error('Word not found');
    }

    const wordId: WordId = word.getId();
    user.removeFavorite(wordId);
    word.decrementFavorites();

    await this.userRepository.save(user);
    await this.wordRepository.save(word);

    const userEvents = user.getEvents();
    const wordEvents = word.getEvents();

    await this.eventBus.publishMany([...userEvents, ...wordEvents]);

    user.clearEvents();
    word.clearEvents();
  }
}
