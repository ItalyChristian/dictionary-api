import { describe, it, expect } from 'vitest';
import { Email } from '@core/domain/value-objects/Email';

describe('Email', () => {
  it('creates a valid email', () => {
    const email = Email.create('user@example.com');
    expect(email.getValue()).toBe('user@example.com');
  });

  it('normalizes the email to lowercase', () => {
    const email = Email.create('User@Example.COM');
    expect(email.getValue()).toBe('user@example.com');
  });

  it.each([
    'plainaddress',
    '@no-local.com',
    'no-at-sign.com',
    'spaces in@email.com',
    'trailing@dot.',
    'missing@tld',
    ''
  ])('throws for invalid email "%s"', (value) => {
    expect(() => Email.create(value)).toThrow('Invalid email format');
  });

  it('considers two equal emails as equal', () => {
    expect(Email.create('a@b.com').equals(Email.create('A@B.com'))).toBe(true);
  });

  it('considers different emails as not equal', () => {
    expect(Email.create('a@b.com').equals(Email.create('c@d.com'))).toBe(false);
  });
});
