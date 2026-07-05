import { CommandHandler } from '../interfaces/CommandHandler';
import { FavoriteWordCommand } from './FavoriteWordCommand';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { WordRepository } from '../../../domain/repositories/WordRepository';
import { EventBusPort } from '../../../ports/event-bus/EventBusPort';
import { WordId } from '../../../domain/value-objects/WordId';

export class FavoriteWordCommandHandler
  implements CommandHandler<FavoriteWordCommand, void>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly wordRepository: WordRepository,
    private readonly eventBus: EventBusPort
  ) {}

  async handle(command: FavoriteWordCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error('User not found');
    }

    let word = await this.wordRepository.findByWord(command.word);
    if (!word) {
      throw new Error('Word not found');
    }

    const wordId: WordId = word.getId();
    user.addFavorite(wordId);
    word.incrementFavorites();

    await this.userRepository.save(user);
    await this.wordRepository.save(word);

    const userEvents = user.getEvents();
    const wordEvents = word.getEvents();
    
    await this.eventBus.publishMany([...userEvents, ...wordEvents]);
    
    user.clearEvents();
    word.clearEvents();
  }
}