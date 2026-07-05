import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';
import { WordId } from '../value-objects/WordId';
import { DomainEvent } from '../events/DomainEvent';
import { UserRegisteredEvent } from '../events/UserRegisteredEvent';
import { WordFavoritedEvent } from '../events/WordFavoritedEvent';
import { WordUnfavoritedEvent } from '../events/WordUnfavoritedEvent';

export class User {
  private readonly events: DomainEvent[] = [];

  private constructor(
    private readonly id: string,
    private email: Email,
    private password: Password,
    private favorites: Set<string>,
    private createdAt: Date
  ) {}

  static create(email: string, plainPassword: string): User {
    const user = new User(
      crypto.randomUUID(),
      Email.create(email),
      Password.create(plainPassword),
      new Set(),
      new Date()
    );
    
    user.raiseEvent(new UserRegisteredEvent(user.id, email));
    return user;
  }

  static reconstitute(
    id: string,
    email: string,
    hashedPassword: string,
    favorites: string[],
    createdAt: Date
  ): User {
    return new User(
      id,
      Email.create(email),
      Password.fromHash(hashedPassword),
      new Set(favorites.map(f => WordId.create(f).getValue())),
      createdAt
    );
  }

  async verifyPassword(plainPassword: string): Promise<boolean> {
    return await this.password.verify(plainPassword);
  }

  async hashPassword(): Promise<void> {
    this.password = await this.password.hash();
  }

  addFavorite(wordId: WordId): void {
    if (this.favorites.has(wordId.getValue())) {
      throw new Error('Word already favorited');
    }
    this.favorites.add(wordId.getValue());
    this.raiseEvent(
      new WordFavoritedEvent(this.id, this.id, wordId.getValue(), wordId.getValue())
    );
  }

  removeFavorite(wordId: WordId): void {
    if (!this.favorites.has(wordId.getValue())) {
      throw new Error('Word not favorited');
    }
    this.favorites.delete(wordId.getValue());
    this.raiseEvent(
      new WordUnfavoritedEvent(this.id, this.id, wordId.getValue(), wordId.getValue())
    );
  }

  getFavorites(): WordId[] {
    return Array.from(this.favorites, value => WordId.create(value));
  }

  isFavorite(wordId: WordId): boolean {
    return this.favorites.has(wordId.getValue());
  }

  private raiseEvent(event: DomainEvent): void {
    this.events.push(event);
  }

  getEvents(): DomainEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events.length = 0;
  }

  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email.getValue();
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
