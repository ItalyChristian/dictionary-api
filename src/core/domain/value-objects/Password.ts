import argon2 from 'argon2';

export class Password {
  private readonly value: string;
  private readonly isHashed: boolean;

  private constructor(value: string, isHashed: boolean = false) {
    this.value = value;
    this.isHashed = isHashed;
  }

  static create(plainPassword: string): Password {
    if (plainPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (!/[0-9]/.test(plainPassword)) {
      throw new Error('Password must contain at least one number');
    }
    if (!/[^A-Za-z0-9]/.test(plainPassword)) {
      throw new Error('Password must contain at least one special character');
    }
    return new Password(plainPassword, false);
  }

  static fromHash(hashedPassword: string): Password {
    return new Password(hashedPassword, true);
  }

  async hash(): Promise<Password> {
    if (this.isHashed) {
      return this;
    }
    const hashed = await argon2.hash(this.value);
    return new Password(hashed, true);
  }

  async verify(plainPassword: string): Promise<boolean> {
    if (!this.isHashed) {
      throw new Error('Cannot verify unhashed password');
    }
    return await argon2.verify(this.value, plainPassword);
  }

  getValue(): string {
    return this.value;
  }
}