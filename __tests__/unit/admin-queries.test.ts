// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAllTeams } from '@/lib/data/db/admin-queries';
import { getUser } from '@/lib/data/db/queries';
import type { User } from '@/lib/data/db/schema';

type UserLike = Pick<User, 'platformRole'>;
const asGetUserResult = (user: UserLike | null) => user as unknown as Awaited<ReturnType<typeof getUser>>;

vi.mock('@/lib/data/db/queries', () => ({
  getUser: vi.fn(),
}));

describe('admin-queries access guard', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('rejects when user is unauthenticated', async () => {
    vi.mocked(getUser).mockResolvedValue(null);
    await expect(getAllTeams()).rejects.toThrow('Forbidden: platform admin access required');
  });

  it('rejects when user has no platform admin role', async () => {
    vi.mocked(getUser).mockResolvedValue(asGetUserResult({ platformRole: null }));
    await expect(getAllTeams()).rejects.toThrow('Forbidden: platform admin access required');
  });

  it('allows platform admin users', async () => {
    const previousDatabaseUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    vi.mocked(getUser).mockResolvedValue(asGetUserResult({ platformRole: 'support' }));

    await expect(getAllTeams()).resolves.toEqual([]);
    expect(warnSpy).toHaveBeenCalled();

    process.env.DATABASE_URL = previousDatabaseUrl;
  });
});
