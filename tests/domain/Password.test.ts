import { describe, it, expect } from 'vitest';
import { Password } from '@core/domain/value-objects/Password';

describe('Password', () => {
  describe('create', () => {
    it('creates a valid password', () => {
      const password = Password.create('secret1!');
      expect(password.getValue()).toBe('secret1!');
    });

    it('throws when shorter than 6 characters', () => {
      expect(() => Password.create('a1!')).toThrow(
        'Password must be at least 6 characters'
      );
    });

    it('throws when missing a number', () => {
      expect(() => Password.create('password!')).toThrow(
        'Password must contain at least one number'
      );
    });

    it('throws when missing a special character', () => {
      expect(() => Password.create('password1')).toThrow(
        'Password must contain at least one special character'
      );
    });
  });

  describe('hash / verify', () => {
    it('hashes a plain password and verifies it', async () => {
      const password = Password.create('secret1!');
      const hashed = await password.hash();

      expect(hashed.getValue()).not.toBe('secret1!');
      expect(hashed.getValue().startsWith('$argon2')).toBe(true);
      expect(await hashed.verify('secret1!')).toBe(true);
      expect(await hashed.verify('wrong1!')).toBe(false);
    });

    it('returns the same instance when hashing an already-hashed password', async () => {
      const hashed = await Password.create('secret1!').hash();
      const again = await hashed.hash();
      expect(again).toBe(hashed);
    });

    it('rebuilds from a hash and verifies correctly', async () => {
      const hashedValue = (await Password.create('secret1!').hash()).getValue();
      const restored = Password.fromHash(hashedValue);
      expect(await restored.verify('secret1!')).toBe(true);
    });

    it('throws when verifying an unhashed password', async () => {
      const password = Password.create('secret1!');
      await expect(password.verify('secret1!')).rejects.toThrow(
        'Cannot verify unhashed password'
      );
    });
  });
});
