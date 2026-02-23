import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
  execute: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
};

vi.mock('@/lib/data/db/drizzle', () => ({
  db: mockDb,
}));

describe('auth-email.service legacy schema compatibility', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('falls back to legacy user query when email_verified_at column is absent', async () => {
    mockDb.execute.mockResolvedValueOnce({ rows: [{ exists: false }] });

    const limit = vi.fn().mockResolvedValueOnce([
      {
        id: 42,
        name: null,
        email: 'legacy@example.com',
        passwordHash: 'hash',
        platformRole: null,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        updatedAt: new Date('2025-01-01T00:00:00.000Z'),
        deletedAt: null,
      },
    ]);
    const where = vi.fn(() => ({ limit }));
    const from = vi.fn(() => ({ where }));
    mockDb.select.mockReturnValueOnce({ from });

    const { findUserByEmailForAuth } = await import('@/lib/services/auth-email.service');

    const user = await findUserByEmailForAuth('legacy@example.com');

    expect(user).toEqual({
      id: 42,
      name: null,
      email: 'legacy@example.com',
      passwordHash: 'hash',
      platformRole: null,
      emailVerifiedAt: null,
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2025-01-01T00:00:00.000Z'),
      deletedAt: null,
      isEmailVerificationSupported: false,
    });
    expect(mockDb.select).toHaveBeenCalledOnce();
  });

  it('skips update when trying to verify email in legacy schema', async () => {
    mockDb.execute.mockResolvedValueOnce({ rows: [{ exists: false }] });

    const { markEmailAsVerified } = await import('@/lib/services/auth-email.service');

    await markEmailAsVerified(10);

    expect(mockDb.update).not.toHaveBeenCalled();
  });
});
