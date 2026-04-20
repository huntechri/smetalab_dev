import { describe, expect, it } from 'vitest';

import { withBalanceSeries } from '@/features/dashboard/lib/performance-dynamics';

describe('home withBalanceSeries', () => {
    it('adds balance by formula receipts - fact work - fact materials', () => {
        const result = withBalanceSeries([
            {
                date: '2026-03-01',
                receiptsFact: 150,
                executionPlan: 120,
                executionFact: 75,
                procurementPlan: 45,
                procurementFact: 20,
            },
        ]);

        expect(result).toEqual([
            {
                date: '2026-03-01',
                receiptsFact: 150,
                executionPlan: 120,
                executionFact: 75,
                procurementPlan: 45,
                procurementFact: 20,
                balance: 55,
            },
        ]);
    });
});
