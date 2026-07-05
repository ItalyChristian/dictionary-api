export class WordId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): WordId {
    if (!value || value.trim().length === 0) {
      throw new Error('WordId cannot be empty');
    }
    return new WordId(value.toLowerCase().trim());
  }

  static generate(): WordId {
    return new WordId(crypto.randomUUID());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: WordId): boolean {
    return this.value === other.value;
  }
}