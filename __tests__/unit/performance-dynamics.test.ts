import { describe, expect, it } from 'vitest';

import { filterDynamicsByRange } from '@/features/projects/dashboard/lib/performance-dynamics';
import { buildPerformanceDynamics } from '@/lib/services/project-performance-dynamics.service';

describe('buildPerformanceDynamics', () => {
    it('merges four series on a shared date axis and fills missing values with zero', () => {
        const result = buildPerformanceDynamics(
            [{ date: '2025-01-01', total: 1000 }],
            [{ date: '2025-01-02', total: 400 }],
            [{ date: '2025-01-01', total: 700 }],
            [{ date: '2025-01-03', total: 200 }],
        );

        expect(result).toEqual([
            {
                date: '2025-01-01',
                executionPlan: 1000,
                executionFact: 0,
                procurementPlan: 700,
                procurementFact: 0,
            },
            {
                date: '2025-01-02',
                executionPlan: 0,
                executionFact: 400,
                procurementPlan: 0,
                procurementFact: 0,
            },
            {
                date: '2025-01-03',
                executionPlan: 0,
                executionFact: 0,
                procurementPlan: 0,
                procurementFact: 200,
            },
        ]);
    });
});

describe('filterDynamicsByRange', () => {
    const data = [
        { date: '2024-12-30', executionPlan: 0, executionFact: 0, procurementPlan: 0, procurementFact: 0 },
        { date: '2025-02-15', executionPlan: 1, executionFact: 2, procurementPlan: 3, procurementFact: 4 },
        { date: '2025-03-20', executionPlan: 1, executionFact: 2, procurementPlan: 3, procurementFact: 4 },
        { date: '2025-05-01', executionPlan: 1, executionFact: 2, procurementPlan: 3, procurementFact: 4 },
    ];

    it('filters by rolling 1 month from today backward', () => {
        const now = new Date('2025-05-15T00:00:00.000Z');

        const result = filterDynamicsByRange(data, '1m', now);

        expect(result.map((item) => item.date)).toEqual(['2025-05-01']);
    });

    it('filters by rolling 3 months from today backward', () => {
        const now = new Date('2025-05-15T00:00:00.000Z');

        const result = filterDynamicsByRange(data, '3m', now);

        expect(result.map((item) => item.date)).toEqual(['2025-02-15', '2025-03-20', '2025-05-01']);
    });

    it('keeps full rolling year for 12m period', () => {
        const now = new Date('2025-05-15T00:00:00.000Z');

        const result = filterDynamicsByRange(data, '12m', now);

        expect(result.map((item) => item.date)).toEqual(['2024-12-30', '2025-02-15', '2025-03-20', '2025-05-01']);
    });
});
