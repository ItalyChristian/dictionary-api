import { describe, it, expect, beforeEach } from 'vitest';
import { FavoriteWordCommandHandler } from '@core/application/commands/words/FavoriteWordCommandHandler';
import { FavoriteWordCommand } from '@core/application/commands/words/FavoriteWordCommand';
import { User } from '@core/domain/entities/User';
import { Word } from '@core/domain/entities/Word';
import { WordFavoritedEvent } from '@core/domain/events/WordFavoritedEvent';
import {
  createUserRepositoryMock,
  createWordRepositoryMock,
  createEventBusMock
} from '../helpers/mocks';

describe('FavoriteWordCommandHandler', () => {
  let userRepository: ReturnType<typeof createUserRepositoryMock>;
  let wordRepository: ReturnType<typeof createWordRepositoryMock>;
  let eventBus: ReturnType<typeof createEventBusMock>;
  let handler: FavoriteWordCommandHandler;

  beforeEach(() => {
    userRepository = createUserRepositoryMock();
    wordRepository = createWordRepositoryMock();
    eventBus = createEventBusMock();
    handler = new FavoriteWordCommandHandler(
      userRepository,
      wordRepository,
      eventBus
    );
  });

  function seedUserAndWord() {
    const user = User.create('Alice', 'alice@example.com', 'secret1!');
    user.clearEvents();
    const word = Word.create('apple', [], []);
    (userRepository.findById as any).mockResolvedValue(user);
    (wordRepository.findByWord as any).mockResolvedValue(word);
    return { user, word };
  }

  it('favorites a word, increments its counter and persists both', async () => {
    const { user, word } = seedUserAndWord();

    await handler.handle(new FavoriteWordCommand(user.getId(), 'apple'));

    expect(user.isFavorite(word.getId())).toBe(true);
    expect(word.getFavoriteCount()).toBe(1);
    expect(userRepository.save).toHaveBeenCalledWith(user);
    expect(wordRepository.save).toHaveBeenCalledWith(word);
  });

  it('publishes the domain events and clears them', async () => {
    const { user, word } = seedUserAndWord();

    await handler.handle(new FavoriteWordCommand(user.getId(), 'apple'));

    expect(eventBus.publishMany).toHaveBeenCalledOnce();
    const events = (eventBus.publishMany as any).mock.calls[0][0];
    expect(events.some((e: any) => e instanceof WordFavoritedEvent)).toBe(true);
    expect(user.getEvents()).toHaveLength(0);
    expect(word.getEvents()).toHaveLength(0);
  });

  it('throws when the user is not found', async () => {
    (userRepository.findById as any).mockResolvedValue(null);

    await expect(
      handler.handle(new FavoriteWordCommand('missing', 'apple'))
    ).rejects.toThrow('User not found');
    expect(wordRepository.save).not.toHaveBeenCalled();
  });

  it('throws when the word is not found', async () => {
    const user = User.create('Alice', 'alice@example.com', 'secret1!');
    (userRepository.findById as any).mockResolvedValue(user);
    (wordRepository.findByWord as any).mockResolvedValue(null);

    await expect(
      handler.handle(new FavoriteWordCommand(user.getId(), 'ghost'))
    ).rejects.toThrow('Word not found');
  });

  it('propagates the error when the word is already favorited', async () => {
    const { user } = seedUserAndWord();
    await handler.handle(new FavoriteWordCommand(user.getId(), 'apple'));

    await expect(
      handler.handle(new FavoriteWordCommand(user.getId(), 'apple'))
    ).rejects.toThrow('Word already favorited');
  });
});
