import { beforeEach, describe, expect, it, vi } from 'vitest';

const unstableCacheMock = vi.hoisted(() => vi.fn((fn: () => Promise<unknown>) => fn));

vi.mock('next/cache', () => ({
  unstable_cache: unstableCacheMock,
}));

import { HomePerformanceDynamicsService } from '@/lib/services/home-performance-dynamics.service';

describe('HomePerformanceDynamicsService cache wrappers', () => {
  beforeEach(() => {
    unstableCacheMock.mockClear();
  });

  it('uses unstable_cache wrapper for listByTeamId', async () => {
    const service = HomePerformanceDynamicsService as unknown as {
      listByTeamIdUncached: (teamId: number) => Promise<Array<{ date: string }>>;
    };

    vi.spyOn(service, 'listByTeamIdUncached').mockResolvedValue([{ date: '2026-01-01' }]);

    const result = await HomePerformanceDynamicsService.listByTeamId(42);

    expect(result).toEqual([{ date: '2026-01-01' }]);
    expect(unstableCacheMock).toHaveBeenCalledWith(
      expect.any(Function),
      ['home-performance-dynamics-42'],
      expect.objectContaining({
        revalidate: 120,
      }),
    );
  });

  it('uses unstable_cache wrapper for hasVisibleEstimatesByTeamId', async () => {
    const service = HomePerformanceDynamicsService as unknown as {
      hasVisibleEstimatesByTeamIdUncached: (teamId: number) => Promise<boolean>;
    };

    vi.spyOn(service, 'hasVisibleEstimatesByTeamIdUncached').mockResolvedValue(true);

    const result = await HomePerformanceDynamicsService.hasVisibleEstimatesByTeamId(7);

    expect(result).toBe(true);
    expect(unstableCacheMock).toHaveBeenCalledWith(
      expect.any(Function),
      ['home-dynamics-visible-estimates-7'],
      expect.objectContaining({
        revalidate: 120,
      }),
    );
  });
});
