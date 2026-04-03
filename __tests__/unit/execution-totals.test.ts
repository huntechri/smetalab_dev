import { describe, expect, it } from 'vitest';
import { calculateExecutionTotals } from '@/features/projects/estimates/lib/execution-totals';
import type { EstimateExecutionRow } from '@/features/projects/estimates/types/execution.dto';

function createRow(overrides: Partial<EstimateExecutionRow>): EstimateExecutionRow {
    return {
        id: '11111111-1111-1111-1111-111111111111',
        estimateRowId: null,
        source: 'from_estimate',
        status: 'not_started',
        code: '1',
        name: 'Работа',
        unit: 'м2',
        plannedQty: 1,
        plannedPrice: 100,
        plannedSum: 100,
        actualQty: 1,
        actualPrice: 100,
        actualSum: 100,
        isCompleted: false,
        order: 1,
        ...overrides,
    };
}

describe('calculateExecutionTotals', () => {
    it('includes planned totals for all rows but actual totals only for done rows', () => {
        const rows: EstimateExecutionRow[] = [
            createRow({ status: 'done', plannedSum: 1000, actualSum: 900 }),
            createRow({ id: '22222222-2222-2222-2222-222222222222', status: 'in_progress', plannedSum: 500, actualSum: 500 }),
            createRow({ id: '33333333-3333-3333-3333-333333333333', status: 'not_started', plannedSum: 200, actualSum: 200 }),
        ];

        const totals = calculateExecutionTotals(rows);

        expect(totals).toEqual({
            planned: 1700,
            actual: 900,
        });
    });
});
