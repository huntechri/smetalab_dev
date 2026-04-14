import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookiesSpy = vi.fn();
const getSessionSpy = vi.fn();
const verifyTokenSpy = vi.fn();
const refreshSessionTokensSpy = vi.fn();

const selectSpy = vi.fn();

vi.mock('react', () => ({
  cache: <T>(fn: T) => fn,
}));

vi.mock('next/headers', () => ({
  cookies: cookiesSpy,
}));

vi.mock('@/lib/infrastructure/auth/session', () => ({
  getSession: getSessionSpy,
  verifyToken: verifyTokenSpy,
  SESSION_COOKIE_NAME: 'access_token',
  REFRESH_COOKIE_NAME: 'refresh_token',
  COOKIE_OPTIONS_ACCESS: { httpOnly: true, secure: true, sameSite: 'none', path: '/' },
  COOKIE_OPTIONS_REFRESH: { httpOnly: true, secure: true, sameSite: 'none', path: '/' },
}));

vi.mock('@/lib/services/auth-refresh.service', () => ({
  refreshSessionTokens: refreshSessionTokensSpy,
}));

vi.mock('@/lib/data/db/tenant', () => ({
  SYSTEM_TENANT_ID: 1,
}));

vi.mock('@/lib/data/db/schema', () => ({
  users: { id: 'users.id', deletedAt: 'users.deletedAt' },
  teamMembers: { userId: 'team_members.userId', teamId: 'team_members.teamId', role: 'team_members.role' },
  activityLogs: {},
  impersonationSessions: { sessionToken: 'impersonation.sessionToken' },
  teams: { id: 'teams.id' },
}));

vi.mock('@/lib/data/db/drizzle', () => ({
  db: {
    select: selectSpy,
    transaction: vi.fn(),
    execute: vi.fn(),
    query: {
      impersonationSessions: { findFirst: vi.fn() },
      teamMembers: { findFirst: vi.fn() },
      teams: { findFirst: vi.fn() },
    },
  },
}));

describe('getUser session refresh', () => {
  beforeEach(() => {
    vi.resetModules();
    selectSpy.mockReset();
    cookiesSpy.mockReset();
    getSessionSpy.mockReset();
    verifyTokenSpy.mockReset();
    refreshSessionTokensSpy.mockReset();
  });

  it('refreshes expired access token and loads user in same request', async () => {
    const cookieGet = vi.fn((name: string) => {
      if (name === 'refresh_token') {
        return { value: 'refresh-token' };
      }
      return undefined;
    });
    const cookieSet = vi.fn();

    cookiesSpy.mockResolvedValue({ get: cookieGet, set: cookieSet });

    getSessionSpy.mockResolvedValue({
      user: { id: 7 },
      platformRole: null,
      expires: '2020-01-01T00:00:00.000Z',
    });

    refreshSessionTokensSpy.mockResolvedValue({
      success: true,
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      accessExpires: new Date('2030-01-01T00:15:00.000Z'),
      refreshExpires: new Date('2030-01-08T00:00:00.000Z'),
    });

    verifyTokenSpy.mockResolvedValue({
      user: { id: 7 },
      platformRole: null,
      expires: '2030-01-01T00:15:00.000Z',
    });

    const limitSpy = vi.fn().mockResolvedValue([
      {
        user: { id: 7, name: 'Test User', email: 't@example.com' },
        teamId: 17,
        role: 'owner',
      },
    ]);

    selectSpy.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: limitSpy,
          }),
        }),
      }),
    });

    const { getUser } = await import('@/lib/data/db/user-team-queries');
    const result = await getUser();

    expect(refreshSessionTokensSpy).toHaveBeenCalledWith('refresh-token');
    expect(cookieSet).toHaveBeenCalledTimes(2);
    expect(verifyTokenSpy).toHaveBeenCalledWith('new-access-token');
    expect(result).toMatchObject({ id: 7, tenantId: 17, teamRole: 'owner' });
  });


  it('refreshes session when getSession returns null due to expired JWT', async () => {
    const cookieGet = vi.fn((name: string) => {
      if (name === 'refresh_token') {
        return { value: 'refresh-token' };
      }
      return undefined;
    });
    const cookieSet = vi.fn();

    cookiesSpy.mockResolvedValue({ get: cookieGet, set: cookieSet });
    getSessionSpy.mockResolvedValue(null);

    refreshSessionTokensSpy.mockResolvedValue({
      success: true,
      accessToken: 'rotated-access',
      refreshToken: 'rotated-refresh',
      accessExpires: new Date('2030-02-01T00:15:00.000Z'),
      refreshExpires: new Date('2030-02-08T00:00:00.000Z'),
    });

    verifyTokenSpy.mockResolvedValue({
      user: { id: 9 },
      platformRole: null,
      expires: '2030-02-01T00:15:00.000Z',
    });

    const limitSpy = vi.fn().mockResolvedValue([
      {
        user: { id: 9, name: 'JWT Expired', email: 'jwt@example.com' },
        teamId: 99,
        role: 'admin',
      },
    ]);

    selectSpy.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: limitSpy,
          }),
        }),
      }),
    });

    const { getUser } = await import('@/lib/data/db/user-team-queries');
    const result = await getUser();

    expect(refreshSessionTokensSpy).toHaveBeenCalledWith('refresh-token');
    expect(verifyTokenSpy).toHaveBeenCalledWith('rotated-access');
    expect(result).toMatchObject({ id: 9, tenantId: 99, teamRole: 'admin' });
  });

  it('returns null when access token is expired and refresh cookie is missing', async () => {
    cookiesSpy.mockResolvedValue({ get: vi.fn(), set: vi.fn() });

    getSessionSpy.mockResolvedValue({
      user: { id: 7 },
      platformRole: null,
      expires: '2020-01-01T00:00:00.000Z',
    });

    const { getUser } = await import('@/lib/data/db/user-team-queries');
    const result = await getUser();

    expect(refreshSessionTokensSpy).not.toHaveBeenCalled();
    expect(selectSpy).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
