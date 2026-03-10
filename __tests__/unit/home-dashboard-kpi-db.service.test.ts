import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sql } from 'drizzle-orm';

const dbExecuteMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/data/db/drizzle', () => ({
    db: {
        execute: dbExecuteMock,
    },
}));

vi.mock('@/lib/data/db/queries', () => ({
    withActiveTenant: vi.fn(() => sql`TRUE`),
}));

import { HomeDashboardKpiService } from '@/lib/services/home-dashboard-kpi.service';

describe('HomeDashboardKpiService SQL aggregation', () => {
    beforeEach(() => {
        dbExecuteMock.mockReset();
    });

    it('builds consolidated KPI model from finance totals and project summary', async () => {
        dbExecuteMock
            .mockResolvedValueOnce([
                {
                    plannedWorks: '320000',
                    plannedMaterials: '180000',
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
            revenue: 500000,
            profit: 200000,
            progress: 64,
            remainingDays: expect.any(Number),
        });
    });

    it('returns zeroed progress and null deadline when there are no projects', async () => {
        dbExecuteMock
            .mockResolvedValueOnce([
                {
                    plannedWorks: '0',
                    plannedMaterials: '0',
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
            profit: 0,
            progress: 0,
            remainingDays: null,
        });
    });
});
