import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rateLimit } from '@/lib/infrastructure/auth/rate-limit';

const mockGet = vi.fn();

vi.mock('next/headers', () => ({
  headers: () => Promise.resolve({
    get: mockGet,
  }),
}));

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockGet.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests under the limit', async () => {
    mockGet.mockReturnValue('1.1.1.1');
    const limit = 5;
    const windowMs = 60000;

    for (let i = 0; i < limit; i++) {
      expect(await rateLimit(limit, windowMs)).toBe(true);
    }
  });

  it('should block requests over the limit', async () => {
    mockGet.mockReturnValue('2.2.2.2');
    const limit = 5;
    const windowMs = 60000;

    for (let i = 0; i < limit; i++) {
      await rateLimit(limit, windowMs);
    }

    expect(await rateLimit(limit, windowMs)).toBe(false);
  });

  it('should reset limit after window expires', async () => {
    mockGet.mockReturnValue('3.3.3.3');
    const limit = 5;
    const windowMs = 60000;

    for (let i = 0; i < limit; i++) {
      await rateLimit(limit, windowMs);
    }

    expect(await rateLimit(limit, windowMs)).toBe(false);

    vi.advanceTimersByTime(windowMs + 1000);

    expect(await rateLimit(limit, windowMs)).toBe(true);
  });
});
