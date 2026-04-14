import { describe, expect, it } from 'vitest';

import {
    buildDynamicsFlowTimeline,
    buildDynamicsTimeline,
    canShowDynamicsChartByEstimateStatuses,
    hasActivityInTimeline,
    withBalanceSeries,
} from '@/features/projects/dashboard/lib/performance-dynamics';
import { buildPerformanceDynamics } from '@/lib/services/project-performance-dynamics.service';

describe('buildPerformanceDynamics', () => {
    it('merges four series on a shared date axis and fills missing values with zero', () => {
        const result = buildPerformanceDynamics(
            [{ date: '2025-01-01', total: 600 }],
            [{ date: '2025-01-01', total: 1000 }],
            [{ date: '2025-01-02', total: 400 }],
            [{ date: '2025-01-01', total: 700 }],
            [{ date: '2025-01-03', total: 200 }],
        );

        expect(result).toEqual([
            {
                date: '2025-01-01',
                receiptsFact: 600,
                executionPlan: 1000,
                executionFact: 0,
                procurementPlan: 700,
                procurementFact: 0,
            },
            {
                date: '2025-01-02',
                receiptsFact: 0,
                executionPlan: 0,
                executionFact: 400,
                procurementPlan: 0,
                procurementFact: 0,
            },
            {
                date: '2025-01-03',
                receiptsFact: 0,
                executionPlan: 0,
                executionFact: 0,
                procurementPlan: 0,
                procurementFact: 200,
            },
        ]);
    });
});

describe('buildDynamicsTimeline', () => {
    const data = [
        { date: '2025-01-18', receiptsFact: 5, executionPlan: 10, executionFact: 0, procurementPlan: 0, procurementFact: 0 },
        { date: '2025-01-20', receiptsFact: 20, executionPlan: 0, executionFact: 3, procurementPlan: 2, procurementFact: 1 },
        { date: '2025-02-01', receiptsFact: 0, executionPlan: 0, executionFact: 7, procurementPlan: 0, procurementFact: 0 },
        { date: '2025-02-15', receiptsFact: 10, executionPlan: 15, executionFact: 4, procurementPlan: 6, procurementFact: 5 },
    ];

    it('builds 1 month timeline by calendar days and keeps zero days', () => {
        const now = new Date('2025-02-20T00:00:00.000Z');

        const timeline = buildDynamicsTimeline(data, '1m', now);

        expect(timeline.at(0)?.date).toBe('2025-01-20');
        expect(timeline.at(-1)?.date).toBe('2025-02-20');
        expect(timeline).toHaveLength(32);
        expect(timeline.find((item) => item.date === '2025-02-10')).toEqual({
            date: '2025-02-10',
            receiptsFact: 25,
            executionPlan: 10,
            executionFact: 10,
            procurementPlan: 2,
            procurementFact: 1,
        });
    });

    it('aggregates 3 months by month buckets and includes the full current month', () => {
        const now = new Date('2025-02-20T00:00:00.000Z');

        const timeline = buildDynamicsTimeline([
            ...data,
            { date: '2025-02-28', receiptsFact: 15, executionPlan: 20, executionFact: 8, procurementPlan: 5, procurementFact: 2 },
        ], '3m', now);

        expect(timeline.map((item) => item.date)).toEqual(['2024-12-01', '2025-01-01', '2025-02-01']);
        expect(timeline[1]).toMatchObject({
            receiptsFact: 25,
            executionPlan: 10,
            executionFact: 3,
            procurementPlan: 2,
            procurementFact: 1,
        });
        expect(timeline[2]).toMatchObject({
            receiptsFact: 50,
            executionPlan: 45,
            executionFact: 22,
            procurementPlan: 13,
            procurementFact: 8,
        });
    });



    it('builds 12 months timeline from current month back to 11 months', () => {
        const now = new Date('2025-02-20T00:00:00.000Z');

        const timeline = buildDynamicsTimeline(data, '12m', now);

        expect(timeline).toHaveLength(12);
        expect(timeline.at(0)?.date).toBe('2024-03-01');
        expect(timeline.at(-1)?.date).toBe('2025-02-01');
    });

    it('applies opening balance from points before range start', () => {
        const now = new Date('2025-02-20T00:00:00.000Z');

        const timeline = buildDynamicsTimeline([
            { date: '2024-12-10', receiptsFact: 50, executionPlan: 100, executionFact: 30, procurementPlan: 25, procurementFact: 10 },
            { date: '2025-01-20', receiptsFact: 5, executionPlan: 10, executionFact: 3, procurementPlan: 2, procurementFact: 1 },
        ], '1m', now);

        expect(timeline.at(0)).toEqual({
            date: '2025-01-20',
            receiptsFact: 55,
            executionPlan: 110,
            executionFact: 33,
            procurementPlan: 27,
            procurementFact: 11,
        });
    });
});

describe('buildDynamicsFlowTimeline', () => {
    it('returns period deltas without carry-forward', () => {
        const now = new Date('2025-02-20T00:00:00.000Z');

        const timeline = buildDynamicsFlowTimeline([
            { date: '2024-12-10', receiptsFact: 50, executionPlan: 100, executionFact: 30, procurementPlan: 25, procurementFact: 10 },
            { date: '2025-01-20', receiptsFact: 5, executionPlan: 10, executionFact: 3, procurementPlan: 2, procurementFact: 1 },
        ], '1m', now);

        expect(timeline.at(0)).toEqual({
            date: '2025-01-20',
            receiptsFact: 5,
            executionPlan: 10,
            executionFact: 3,
            procurementPlan: 2,
            procurementFact: 1,
        });
        expect(timeline.find((item) => item.date === '2025-01-21')).toEqual({
            date: '2025-01-21',
            receiptsFact: 0,
            executionPlan: 0,
            executionFact: 0,
            procurementPlan: 0,
            procurementFact: 0,
        });
    });
});

describe('hasActivityInTimeline', () => {
    it('returns false for all-zero timeline and true when any series has value', () => {
        expect(hasActivityInTimeline([{ date: '2025-02-01', receiptsFact: 0, executionPlan: 0, executionFact: 0, procurementPlan: 0, procurementFact: 0 }])).toBe(false);
        expect(hasActivityInTimeline([{ date: '2025-02-01', receiptsFact: 0, executionPlan: 0, executionFact: 1, procurementPlan: 0, procurementFact: 0 }])).toBe(true);
    });
});

describe('withBalanceSeries', () => {
    it('adds balance series by formula receipts - fact work - fact materials', () => {
        const result = withBalanceSeries([
            {
                date: '2025-03-01',
                receiptsFact: 90,
                executionPlan: 100,
                executionFact: 60,
                procurementPlan: 30,
                procurementFact: 10,
            },
        ]);

        expect(result).toEqual([
            {
                date: '2025-03-01',
                receiptsFact: 90,
                executionPlan: 100,
                executionFact: 60,
                procurementPlan: 30,
                procurementFact: 10,
                balance: 20,
            },
        ]);
    });
});

describe('canShowDynamicsChartByEstimateStatuses', () => {
    it('returns false when only draft statuses exist', () => {
        expect(canShowDynamicsChartByEstimateStatuses(['draft', 'draft'])).toBe(false);
    });

    it('returns true when at least one in_progress or approved status exists', () => {
        expect(canShowDynamicsChartByEstimateStatuses(['draft', 'in_progress'])).toBe(true);
        expect(canShowDynamicsChartByEstimateStatuses(['approved'])).toBe(true);
    });
});
