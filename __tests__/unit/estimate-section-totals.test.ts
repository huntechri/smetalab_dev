import { describe, expect, it } from 'vitest';
import { getSectionTotals, SECTION_WITHOUT_GROUP_ID } from '@/features/projects/estimates/lib/section-totals';
import { EstimateRow } from '@/features/projects/estimates/types/dto';

describe('getSectionTotals', () => {
    it('groups rows by section boundaries and keeps pre-section bucket', () => {
        const rows: EstimateRow[] = [
            { id: 'w0', kind: 'work', code: '1', name: 'Pre section', unit: 'шт', qty: 1, price: 10, sum: 10, expense: 0, order: 1 },
            { id: 's1', kind: 'section', code: 'S1', name: 'Раздел 1', unit: '', qty: 0, price: 0, sum: 0, expense: 0, order: 2 },
            { id: 'w1', kind: 'work', code: '2', name: 'Work', unit: 'шт', qty: 1, price: 20, sum: 20, expense: 0, order: 3 },
            { id: 'm1', kind: 'material', parentWorkId: 'w1', code: '2.1', name: 'Material', unit: 'шт', qty: 1, price: 5, sum: 5, expense: 0, order: 4 },
        ];

        const result = getSectionTotals(rows);

        expect(result.get(SECTION_WITHOUT_GROUP_ID)).toBe(10);
        expect(result.get('s1')).toBe(25);
    });
});
