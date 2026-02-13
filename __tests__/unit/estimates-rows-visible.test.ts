import { describe, expect, it } from 'vitest';
import { getVisibleRows } from '@/features/projects/estimates/lib/rows-visible';
import { EstimateRow } from '@/features/projects/estimates/types/dto';

const rows: EstimateRow[] = [
    { id: 'w1', kind: 'work', code: '1', name: 'Work 1', unit: 'шт', qty: 1, price: 100, sum: 100, expense: 0, order: 100 },
    { id: 'm1', kind: 'material', parentWorkId: 'w1', code: '1.1', name: 'Material 1', unit: 'шт', qty: 1, price: 50, sum: 50, expense: 0, order: 101 },
    { id: 'w2', kind: 'work', code: '2', name: 'Work 2', unit: 'шт', qty: 1, price: 100, sum: 100, expense: 0, order: 200 },
];

describe('getVisibleRows', () => {
    it('shows only work rows when collapsed', () => {
        const result = getVisibleRows(rows, new Set());
        expect(result.map((row) => row.id)).toEqual(['w1', 'w2']);
    });

    it('shows materials only for expanded work', () => {
        const result = getVisibleRows(rows, new Set(['w1']));
        expect(result.map((row) => row.id)).toEqual(['w1', 'm1', 'w2']);
    });
});
