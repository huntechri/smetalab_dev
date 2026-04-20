import { describe, expect, it } from 'vitest';
import { calculateExecutionMoneyMetrics } from '@/features/projects/estimates/lib/execution-metrics';

describe('calculateExecutionMoneyMetrics', () => {
    it('calculates planned, actual and margin for regular rows', () => {
        const metrics = calculateExecutionMoneyMetrics(10, 100, 8, 120);

        expect(metrics.plannedSum).toBe(1000);
        expect(metrics.actualSum).toBe(960);
        expect(metrics.deltaSum).toBe(-40);
        expect(metrics.marginPercent).toBe(4);
    });

    it('returns null margin when planned sum is zero (extra work)', () => {
        const metrics = calculateExecutionMoneyMetrics(0, 0, 2, 500);

        expect(metrics.plannedSum).toBe(0);
        expect(metrics.actualSum).toBe(1000);
        expect(metrics.deltaSum).toBe(1000);
        expect(metrics.marginPercent).toBeNull();
    });
});
