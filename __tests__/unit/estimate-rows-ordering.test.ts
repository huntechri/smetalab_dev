import { describe, expect, it } from 'vitest';
import { EstimateRowsMaintenance } from '@/lib/services/estimate-rows.service';

describe('EstimateRowsMaintenance.resolveInsertOrder', () => {
    it('uses fallback step when there is no next row', () => {
        const result = EstimateRowsMaintenance.resolveInsertOrder(500, null, 100);

        expect(result).toEqual({
            order: 600,
            shouldShiftTail: false,
        });
    });

    it('reuses free gap without shifting tail rows', () => {
        const result = EstimateRowsMaintenance.resolveInsertOrder(1000, 1200, 100);

        expect(result).toEqual({
            order: 1100,
            shouldShiftTail: false,
        });
    });

    it('requests tail shift when there is no free gap', () => {
        const result = EstimateRowsMaintenance.resolveInsertOrder(250, 251, 1);

        expect(result).toEqual({
            order: 251,
            shouldShiftTail: true,
        });
    });
});

