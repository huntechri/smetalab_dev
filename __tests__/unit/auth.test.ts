import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  comparePasswords,
  signToken,
} from '@/lib/infrastructure/auth/session';

describe('Auth Session Utility', () => {
  it('should hash and compare passwords correctly', async () => {
    const previousSecret = process.env.AUTH_SECRET;
    delete process.env.AUTH_SECRET;

    try {
      const password = 'mysecretpassword';
      const hashed = await hashPassword(password);

      expect(hashed).not.toBe(password);

      const isMatch = await comparePasswords(password, hashed);
      expect(isMatch).toBe(true);

      const isNotMatch = await comparePasswords('wrongpassword', hashed);
      expect(isNotMatch).toBe(false);
    } finally {
      process.env.AUTH_SECRET = previousSecret;
    }
  });

  it('should throw when signing token without AUTH_SECRET', async () => {
    const previousSecret = process.env.AUTH_SECRET;
    delete process.env.AUTH_SECRET;

    try {
      await expect(
        signToken({
          user: { id: 1 },
          platformRole: null,
          expires: new Date().toISOString(),
        })
      ).rejects.toThrow('AUTH_SECRET is required for token signing and verification');
    } finally {
      process.env.AUTH_SECRET = previousSecret;
    }
  });

  it('should throw when signing token with short AUTH_SECRET', async () => {
    const previousSecret = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = 'short-secret';

    try {
      await expect(
        signToken({
          user: { id: 1 },
          platformRole: null,
          expires: new Date().toISOString(),
        })
      ).rejects.toThrow('AUTH_SECRET must be at least 32 characters long');
    } finally {
      process.env.AUTH_SECRET = previousSecret;
    }
  });
});
