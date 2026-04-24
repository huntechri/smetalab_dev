import { describe, expect, it, vi } from 'vitest';

const revalidateTagMock = vi.hoisted(() => vi.fn());

vi.mock('next/cache', () => ({
  revalidateTag: revalidateTagMock,
}));

import { invalidateHomeDashboardCache } from '@/lib/services/home-dashboard-cache';

describe('invalidateHomeDashboardCache', () => {
  it('revalidates shared and team-scoped dashboard tags', () => {
    invalidateHomeDashboardCache(42);

    expect(revalidateTagMock).toHaveBeenCalledWith('home-dashboard-kpi', 'max');
    expect(revalidateTagMock).toHaveBeenCalledWith('home-dashboard-kpi-42', 'max');
    expect(revalidateTagMock).toHaveBeenCalledWith('home-performance-dynamics', 'max');
    expect(revalidateTagMock).toHaveBeenCalledWith('home-performance-dynamics-42', 'max');
    expect(revalidateTagMock).toHaveBeenCalledWith('home-dynamics-visible-estimates', 'max');
    expect(revalidateTagMock).toHaveBeenCalledWith('home-dynamics-visible-estimates-42', 'max');
  });
});
