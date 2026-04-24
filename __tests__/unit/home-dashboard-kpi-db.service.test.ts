import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sql } from 'drizzle-orm';

const dbExecuteMock = vi.hoisted(() => vi.fn());
const unstableCacheMock = vi.hoisted(() => vi.fn((fn: () => Promise<unknown>) => fn));

vi.mock('@/lib/data/db/drizzle', () => ({
    db: {
        execute: dbExecuteMock,
    },
}));

vi.mock('@/lib/data/db/queries', () => ({
    withActiveTenant: vi.fn(() => sql`TRUE`),
}));

vi.mock('next/cache', () => ({
    unstable_cache: unstableCacheMock,
}));

import { HomeDashboardKpiService } from '@/lib/services/home-dashboard-kpi.service';

describe('HomeDashboardKpiService SQL aggregation', () => {
    beforeEach(() => {
        dbExecuteMock.mockReset();
        unstableCacheMock.mockClear();
    });

    it('builds consolidated KPI model from confirmed receipts and actual totals', async () => {
        dbExecuteMock
            .mockResolvedValueOnce([
                {
                    confirmedReceipts: '280000',
                    actualWorks: '210000',
                    actualMaterials: '90000',
                },
            ])
            .mockResolvedValueOnce([
                {
                    avgProgress: '64',
                    nearestEndDate: '2026-03-25T00:00:00.000Z',
                },
            ]);

        const result = await HomeDashboardKpiService.getByTeamId(4);

        expect(dbExecuteMock).toHaveBeenCalledTimes(2);
        expect(result).toEqual({
            revenue: 280000,
            expense: 300000,
            profit: -20000,
            progress: 64,
            remainingDays: expect.any(Number),
        });
    });

    it('returns zeroed progress and null deadline when there are no projects', async () => {
        dbExecuteMock
            .mockResolvedValueOnce([
                {
                    confirmedReceipts: '0',
                    actualWorks: '0',
                    actualMaterials: '0',
                },
            ])
            .mockResolvedValueOnce([
                {
                    avgProgress: null,
                    nearestEndDate: null,
                },
            ]);

        const result = await HomeDashboardKpiService.getByTeamId(4);

        expect(result).toEqual({
            revenue: 0,
            expense: 0,
            profit: 0,
            progress: 0,
            remainingDays: null,
        });
    });

    it('falls back to finance query without receipts table when migration is not applied yet', async () => {
        dbExecuteMock
            .mockRejectedValueOnce({ cause: { code: '42P01' } })
            .mockResolvedValueOnce([
                {
                    actualWorks: '1000',
                    actualMaterials: '500',
                },
            ])
            .mockResolvedValueOnce([
                {
                    avgProgress: '40',
                    nearestEndDate: null,
                },
            ]);

        const result = await HomeDashboardKpiService.getByTeamId(4);

        expect(dbExecuteMock).toHaveBeenCalledTimes(3);
        expect(result).toEqual({
            revenue: 0,
            expense: 1500,
            profit: -1500,
            progress: 40,
            remainingDays: null,
        });
    });

    it('wraps KPI query with unstable_cache per team key', async () => {
        dbExecuteMock
            .mockResolvedValueOnce([
                { confirmedReceipts: '100', actualWorks: '40', actualMaterials: '10' },
            ])
            .mockResolvedValueOnce([
                { avgProgress: '10', nearestEndDate: null },
            ]);

        await HomeDashboardKpiService.getByTeamId(99);

        expect(unstableCacheMock).toHaveBeenCalledWith(
            expect.any(Function),
            ['home-dashboard-kpi-99'],
            expect.objectContaining({ revalidate: 120 }),
        );
    });
});
