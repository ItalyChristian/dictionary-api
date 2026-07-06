import { WordId } from '../value-objects/WordId';
import { DomainEvent } from '../events/types/DomainEvent';
import { Meaning, Phonetic } from './types/types';

export class Word {
  private readonly events: DomainEvent[] = [];

  private constructor(
    private readonly id: WordId,
    private readonly word: string,
    private meanings: Meaning[],
    private phonetics: Phonetic[],
    private favoriteCount: number,
    private viewCount: number,
    private createdAt: Date
  ) {}

  static create(word: string, meanings: Meaning[], phonetics: Phonetic[]): Word {
    return new Word(
      WordId.create(word),
      word.toLowerCase(),
      meanings,
      phonetics,
      0,
      0,
      new Date()
    );
  }

  static reconstitute(
    id: string,
    word: string,
    meanings: Meaning[],
    phonetics: Phonetic[],
    favoriteCount: number,
    viewCount: number,
    createdAt: Date
  ): Word {
    return new Word(
      WordId.create(id),
      word,
      meanings,
      phonetics,
      favoriteCount,
      viewCount,
      createdAt
    );
  }

  incrementViews(): void {
    this.viewCount++;
  }

  enrich(meanings: Meaning[], phonetics: Phonetic[]): void {
    this.meanings = meanings;
    this.phonetics = phonetics;
  }

  hasDetails(): boolean {
    return this.meanings.length > 0;
  }

  incrementFavorites(): void {
    this.favoriteCount++;
  }

  decrementFavorites(): void {
    this.favoriteCount--;
    if (this.favoriteCount < 0) {
      this.favoriteCount = 0;
    }
  }

  getId(): WordId {
    return this.id;
  }

  getWord(): string {
    return this.word;
  }

  getMeanings(): Meaning[] {
    return [...this.meanings];
  }

  getPhonetics(): Phonetic[] {
    return [...this.phonetics];
  }

  getFavoriteCount(): number {
    return this.favoriteCount;
  }

  getViewCount(): number {
    return this.viewCount;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getEvents(): DomainEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events.length = 0;
  }

  toJSON(): any {
    return {
      word: this.word,
      meanings: this.meanings,
      phonetics: this.phonetics,
      stats: {
        favorites: this.favoriteCount,
        views: this.viewCount
      }
    };
  }
}