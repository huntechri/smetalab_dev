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

import { ProjectDashboardKpiService } from '@/lib/services/project-dashboard-kpi.service';

describe('ProjectDashboardKpiService SQL aggregation', () => {
    beforeEach(() => {
        dbExecuteMock.mockReset();
    });

    it('loads all KPI totals from a single SQL statement', async () => {
        dbExecuteMock.mockResolvedValue([
            {
                plannedWorks: '120000',
                plannedMaterials: '45000',
                actualWorks: '90000',
                actualMaterials: '31000',
            },
        ]);

        const result = await ProjectDashboardKpiService.getByProjectId(4, 'project-uuid');

        expect(dbExecuteMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            plannedWorks: 120000,
            plannedMaterials: 45000,
            actualWorks: 90000,
            actualMaterials: 31000,
        });
    });

    it('skips EXPLAIN checks when project footprint is below threshold', async () => {
        dbExecuteMock.mockResolvedValueOnce([{ totalRows: '450' }]);

        const result = await ProjectDashboardKpiService.runExplainChecksForLargeProject(4, 'project-uuid', {
            rowThreshold: 1000,
        });

        expect(result).toBeNull();
        expect(dbExecuteMock).toHaveBeenCalledTimes(1);
    });

    it('runs EXPLAIN checks when project footprint exceeds threshold', async () => {
        dbExecuteMock
            .mockResolvedValueOnce([{ totalRows: '1500' }])
            .mockResolvedValueOnce([
                { 'QUERY PLAN': 'CTE Scan on execution_totals  (cost=0.00..1.00 rows=1 width=32)' },
                { 'QUERY PLAN': 'CTE Scan on material_totals  (cost=0.00..1.00 rows=1 width=32)' },
            ]);

        const result = await ProjectDashboardKpiService.runExplainChecksForLargeProject(4, 'project-uuid', {
            rowThreshold: 1000,
        });

        expect(dbExecuteMock).toHaveBeenCalledTimes(2);
        expect(result).toEqual({
            totalRows: 1500,
            plan: [
                'CTE Scan on execution_totals  (cost=0.00..1.00 rows=1 width=32)',
                'CTE Scan on material_totals  (cost=0.00..1.00 rows=1 width=32)',
            ],
        });
    });
});
