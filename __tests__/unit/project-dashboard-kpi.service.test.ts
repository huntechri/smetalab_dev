import { describe, expect, it } from 'vitest';

import { buildProjectDashboardKpiViewModel, calculateDaysRemaining } from '@/lib/services/project-dashboard-kpi.service';

describe('project-dashboard-kpi.service', () => {
    it('calculates remaining days for future end date', () => {
        const now = new Date('2026-01-01T12:00:00.000Z');
        const endDate = new Date('2026-01-03T00:00:00.000Z');

        const result = calculateDaysRemaining(endDate, now);

        expect(result).toBe(2);
    });

    it('returns negative remaining days for past end date', () => {
        const now = new Date('2026-01-10T00:00:00.000Z');
        const endDate = new Date('2026-01-09T23:59:59.000Z');

        const result = calculateDaysRemaining(endDate, now);

        expect(result).toBe(-1);
    });

    it('builds dashboard kpi model from planned and actual totals', () => {
        const result = buildProjectDashboardKpiViewModel({
            finance: {
                confirmedReceipts: 160_000,
                plannedWorks: 120_000,
                plannedMaterials: 80_000,
                actualWorks: 90_000,
                actualMaterials: 40_000,
            },
            progress: 65,
            endDate: new Date('2026-02-01T00:00:00.000Z'),
            now: new Date('2026-01-20T00:00:00.000Z'),
        });

        expect(result).toEqual({
            revenue: 160_000,
            expense: 130_000,
            profit: 30_000,
            progress: 65,
            remainingDays: 12,
        });
    });
});
