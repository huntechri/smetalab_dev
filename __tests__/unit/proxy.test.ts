import { beforeEach, describe, expect, it, vi } from 'vitest';

const nextSpy = vi.fn();
const redirectSpy = vi.fn();
const verifyTokenSpy = vi.fn();
const refreshSessionTokensSpy = vi.fn();

vi.mock('next/server', () => ({
  NextResponse: {
    next: nextSpy,
    redirect: redirectSpy,
  },
}));

vi.mock('@/lib/infrastructure/auth/session', () => ({
  SESSION_COOKIE_NAME: 'access_token',
  REFRESH_COOKIE_NAME: 'refresh_token',
  verifyToken: verifyTokenSpy,
}));

vi.mock('@/lib/services/auth-refresh.service', () => ({
  refreshSessionTokens: refreshSessionTokensSpy,
}));

describe('proxy auth refresh flow', () => {
  beforeEach(() => {
    nextSpy.mockReset();
    redirectSpy.mockReset();
    verifyTokenSpy.mockReset();
    refreshSessionTokensSpy.mockReset();
  });

  it('refreshes session on protected GET when access token is missing but refresh token exists', async () => {
    const cookieSetSpy = vi.fn();
    const nextResponse = { cookies: { set: cookieSetSpy } };
    nextSpy.mockReturnValue(nextResponse);

    refreshSessionTokensSpy.mockResolvedValue({
      success: true,
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      accessExpires: new Date('2030-01-01T00:15:00.000Z'),
      refreshExpires: new Date('2030-01-08T00:00:00.000Z'),
    });

    const request = {
      method: 'GET',
      url: 'https://example.com/app',
      nextUrl: { pathname: '/app' },
      cookies: {
        get: (name: string) => {
          if (name === 'access_token') return undefined;
          if (name === 'refresh_token') return { value: 'refresh' };
          return undefined;
        },
      },
    };

    const { default: proxy } = await import('@/proxy');
    const response = await proxy(request as never);

    expect(response).toBe(nextResponse);
    expect(refreshSessionTokensSpy).toHaveBeenCalledWith('refresh');
    expect(cookieSetSpy).toHaveBeenCalledTimes(2);
    expect(cookieSetSpy).toHaveBeenNthCalledWith(
      2,
      'refresh_token',
      'new-refresh',
      expect.objectContaining({ path: '/' })
    );
    expect(redirectSpy).not.toHaveBeenCalled();
  });
});
