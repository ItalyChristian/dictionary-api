import { describe, it, expect, beforeEach } from 'vitest';
import { UnfavoriteWordCommandHandler } from '@core/application/commands/words/UnfavoriteWordCommandHandler';
import { UnfavoriteWordCommand } from '@core/application/commands/words/UnfavoriteWordCommand';
import { User } from '@core/domain/entities/User';
import { Word } from '@core/domain/entities/Word';
import { WordId } from '@core/domain/value-objects/WordId';
import { WordUnfavoritedEvent } from '@core/domain/events/WordUnfavoritedEvent';
import {
  createUserRepositoryMock,
  createWordRepositoryMock,
  createEventBusMock
} from '../helpers/mocks';

describe('UnfavoriteWordCommandHandler', () => {
  let userRepository: ReturnType<typeof createUserRepositoryMock>;
  let wordRepository: ReturnType<typeof createWordRepositoryMock>;
  let eventBus: ReturnType<typeof createEventBusMock>;
  let handler: UnfavoriteWordCommandHandler;

  beforeEach(() => {
    userRepository = createUserRepositoryMock();
    wordRepository = createWordRepositoryMock();
    eventBus = createEventBusMock();
    handler = new UnfavoriteWordCommandHandler(
      userRepository,
      wordRepository,
      eventBus
    );
  });

  function seedFavorited() {
    const user = User.create('Alice', 'alice@example.com', 'secret1!');
    user.addFavorite(WordId.create('apple'));
    user.clearEvents();
    const word = Word.reconstitute('apple', 'apple', [], [], 3, 0, new Date());
    (userRepository.findById as any).mockResolvedValue(user);
    (wordRepository.findByWord as any).mockResolvedValue(word);
    return { user, word };
  }

  it('removes a favorite, decrements the counter and persists both', async () => {
    const { user, word } = seedFavorited();

    await handler.handle(new UnfavoriteWordCommand(user.getId(), 'apple'));

    expect(user.isFavorite(WordId.create('apple'))).toBe(false);
    expect(word.getFavoriteCount()).toBe(2);
    expect(userRepository.save).toHaveBeenCalledWith(user);
    expect(wordRepository.save).toHaveBeenCalledWith(word);
  });

  it('publishes the WordUnfavoritedEvent and clears events', async () => {
    const { user } = seedFavorited();

    await handler.handle(new UnfavoriteWordCommand(user.getId(), 'apple'));

    const events = (eventBus.publishMany as any).mock.calls[0][0];
    expect(events.some((e: any) => e instanceof WordUnfavoritedEvent)).toBe(true);
    expect(user.getEvents()).toHaveLength(0);
  });

  it('throws when the user is not found', async () => {
    (userRepository.findById as any).mockResolvedValue(null);
    await expect(
      handler.handle(new UnfavoriteWordCommand('missing', 'apple'))
    ).rejects.toThrow('User not found');
  });

  it('throws when the word is not found', async () => {
    const user = User.create('Alice', 'alice@example.com', 'secret1!');
    (userRepository.findById as any).mockResolvedValue(user);
    (wordRepository.findByWord as any).mockResolvedValue(null);

    await expect(
      handler.handle(new UnfavoriteWordCommand(user.getId(), 'ghost'))
    ).rejects.toThrow('Word not found');
  });

  it('propagates the error when the word was not favorited', async () => {
    const user = User.create('Alice', 'alice@example.com', 'secret1!');
    const word = Word.create('apple', [], []);
    (userRepository.findById as any).mockResolvedValue(user);
    (wordRepository.findByWord as any).mockResolvedValue(word);

    await expect(
      handler.handle(new UnfavoriteWordCommand(user.getId(), 'apple'))
    ).rejects.toThrow('Word not favorited');
  });
});
