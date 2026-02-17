import { describe, expect, it } from 'vitest';
import { buildEstimateProcurementRows } from '@/lib/services/estimate-procurement.service';

describe('buildEstimateProcurementRows', () => {
    it('consolidates plan rows, merges actual purchases and includes fact-only rows', () => {
        const rows = buildEstimateProcurementRows(
            [
                { name: 'Штукатурка', unit: 'меш', qty: 60, price: 500 },
                { name: 'ШТУКАТУРКА', unit: 'меш', qty: 40, price: 500 },
                { name: 'Грунтовка', unit: 'л', qty: 10, price: 80 },
            ],
            [
                { materialName: 'Штукатурка', unit: 'меш', qty: 50, price: 100, purchaseDate: '2026-12-16' },
                { materialName: 'Штукатурка', unit: 'меш', qty: 50, price: 120, purchaseDate: '2026-12-17' },
                { materialName: 'Краска', unit: 'л', qty: 3, price: 700, purchaseDate: '2026-12-18' },
            ],
        );

        expect(rows).toHaveLength(3);
        expect(rows[0].source).toBe('estimate');
        expect(rows[0].materialName).toBe('Грунтовка');
        expect(rows[1].source).toBe('estimate');
        expect(rows[1].materialName).toBe('Штукатурка');
        expect(rows[2].source).toBe('fact_only');
        expect(rows[2].materialName).toBe('Краска');

        expect(rows[1]).toMatchObject({
            plannedQty: 100,
            plannedPrice: 500,
            plannedAmount: 50000,
            actualQty: 100,
            actualAvgPrice: 110,
            actualAmount: 11000,
            qtyDelta: 0,
            amountDelta: 39000,
            purchaseCount: 2,
            lastPurchaseDate: '2026-12-17',
        });

        expect(rows[2]).toMatchObject({
            plannedQty: 0,
            plannedAmount: 0,
            actualQty: 3,
            actualAvgPrice: 700,
            qtyDelta: -3,
            amountDelta: -2100,
            source: 'fact_only',
        });
    });
});
