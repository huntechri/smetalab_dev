import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookiesSpy = vi.fn();
const getSessionSpy = vi.fn();
const verifyTokenSpy = vi.fn();
const refreshSessionTokensSpy = vi.fn();

const selectSpy = vi.fn();
const impersonationFindFirstSpy = vi.fn();

const eqSpy = vi.fn((...args: unknown[]) => ({ op: 'eq', args }));
const isNullSpy = vi.fn((...args: unknown[]) => ({ op: 'isNull', args }));
const andSpy = vi.fn((...args: unknown[]) => ({ op: 'and', args }));

vi.mock('react', () => ({
  cache: <T>(fn: T) => fn,
}));

vi.mock('next/headers', () => ({
  cookies: cookiesSpy,
}));

vi.mock('drizzle-orm', () => ({
  eq: eqSpy,
  isNull: isNullSpy,
  and: andSpy,
  desc: vi.fn(),
  sql: vi.fn(),
}));

vi.mock('@/lib/infrastructure/auth/session', () => ({
  getSession: getSessionSpy,
  verifyToken: verifyTokenSpy,
  SESSION_COOKIE_NAME: 'access_token',
  REFRESH_COOKIE_NAME: 'refresh_token',
}));

vi.mock('@/lib/services/auth-refresh.service', () => ({
  refreshSessionTokens: refreshSessionTokensSpy,
}));

vi.mock('@/lib/data/db/tenant', () => ({
  SYSTEM_TENANT_ID: 1,
}));

vi.mock('@/lib/data/db/schema', () => ({
  users: { id: 'users.id', deletedAt: 'users.deletedAt' },
  teamMembers: { userId: 'team_members.userId', teamId: 'team_members.teamId', role: 'team_members.role', leftAt: 'team_members.leftAt' },
  activityLogs: {},
  impersonationSessions: { sessionToken: 'impersonation.sessionToken', endedAt: 'impersonation.endedAt' },
  teams: { id: 'teams.id' },
}));

vi.mock('@/lib/data/db/drizzle', () => ({
  db: {
    select: selectSpy,
    transaction: vi.fn(),
    execute: vi.fn(),
    query: {
      impersonationSessions: { findFirst: impersonationFindFirstSpy },
      teamMembers: { findFirst: vi.fn() },
      teams: { findFirst: vi.fn() },
    },
  },
}));

describe('user-team queries security filters', () => {
  beforeEach(() => {
    vi.resetModules();
    cookiesSpy.mockReset();
    getSessionSpy.mockReset();
    verifyTokenSpy.mockReset();
    refreshSessionTokensSpy.mockReset();
    selectSpy.mockReset();
    impersonationFindFirstSpy.mockReset();
    eqSpy.mockClear();
    isNullSpy.mockClear();
    andSpy.mockClear();
  });

  it('applies active membership filter in getUser leftJoin', async () => {
    cookiesSpy.mockResolvedValue({ get: vi.fn(), set: vi.fn() });
    getSessionSpy.mockResolvedValue({ user: { id: 5 }, platformRole: null, expires: '2030-01-01T00:00:00.000Z' });

    const limitSpy = vi.fn().mockResolvedValue([
      { user: { id: 5, email: 'a@a.com' }, teamId: 2, role: 'admin' },
    ]);

    selectSpy.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({ limit: limitSpy }),
        }),
      }),
    });

    const { getUser } = await import('@/lib/data/db/user-team-queries');
    await getUser();

    expect(isNullSpy).toHaveBeenCalledWith('team_members.leftAt');
  });

  it('filters ended impersonation sessions when resolving team from impersonation cookie', async () => {
    const cookieGet = vi.fn((name: string) => {
      if (name === 'impersonation_id') {
        return { value: 'token-1' };
      }
      return undefined;
    });

    cookiesSpy.mockResolvedValue({ get: cookieGet, set: vi.fn() });
    impersonationFindFirstSpy.mockResolvedValue(null);
    getSessionSpy.mockResolvedValue(null);

    const { getTeamForUser } = await import('@/lib/data/db/user-team-queries');
    await getTeamForUser();

    expect(eqSpy).toHaveBeenCalledWith('impersonation.sessionToken', 'token-1');
    expect(isNullSpy).toHaveBeenCalledWith('impersonation.endedAt');
    expect(andSpy).toHaveBeenCalled();
  });
});
