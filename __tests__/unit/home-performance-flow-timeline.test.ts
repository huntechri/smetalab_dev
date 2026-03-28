import { describe, expect, it } from 'vitest';

import { buildDynamicsFlowTimeline } from '@/features/dashboard/lib/performance-dynamics';

describe('home buildDynamicsFlowTimeline', () => {
    it('keeps per-period deltas without converting them to cumulative levels', () => {
        const now = new Date('2026-03-20T00:00:00.000Z');

        const timeline = buildDynamicsFlowTimeline([
            { date: '2026-01-01', executionPlan: 500, executionFact: 200, procurementPlan: 100, procurementFact: 50 },
            { date: '2026-03-05', executionPlan: 40, executionFact: 10, procurementPlan: 5, procurementFact: 3 },
        ], '1m', now);

        expect(timeline.find((point) => point.date === '2026-03-05')).toEqual({
            date: '2026-03-05',
            executionPlan: 40,
            executionFact: 10,
            procurementPlan: 5,
            procurementFact: 3,
        });

        expect(timeline.find((point) => point.date === '2026-03-06')).toEqual({
            date: '2026-03-06',
            executionPlan: 0,
            executionFact: 0,
            procurementPlan: 0,
            procurementFact: 0,
        });
    });
});
