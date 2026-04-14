import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cookies } from 'next/headers';

describe('session helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('reads the access_token cookie for session validation', async () => {
    const getCookie = vi.fn((name: string) => {
      if (name === 'access_token') {
        return undefined;
      }
      return undefined;
    });

    const cookieStore = {
      get: getCookie,
      set: vi.fn(),
      delete: vi.fn(),
    } as unknown as Awaited<ReturnType<typeof cookies>>;

    vi.mocked(cookies).mockResolvedValue(cookieStore);

    const { getSession } = await import('@/lib/infrastructure/auth/session');
    const result = await getSession();

    expect(getCookie).toHaveBeenCalledWith('access_token');
    expect(result).toBeNull();
  });

  it('uses /api/refresh as the refresh endpoint path', async () => {
    const { REFRESH_ENDPOINT_PATH, REFRESH_ENDPOINT_ALIASES } = await import('@/lib/infrastructure/auth/session');

    expect(REFRESH_ENDPOINT_PATH).toBe('/api/refresh');
    expect(REFRESH_ENDPOINT_ALIASES).toEqual(['/api/auth/refresh']);
  });
});
