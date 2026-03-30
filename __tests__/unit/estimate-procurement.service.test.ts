import { describe, expect, it } from 'vitest';
import { buildEstimateProcurementRows, shouldRefreshProcurementCache } from '@/lib/services/estimate-procurement.service';

describe('buildEstimateProcurementRows', () => {
    it('consolidates plan rows, merges actual purchases and includes fact-only rows', () => {
        const rows = buildEstimateProcurementRows(
            [
                { name: 'Штукатурка', materialId: null, unit: 'меш', qty: 60, price: 500 },
                { name: 'ШТУКАТУРКА', materialId: null, unit: 'меш', qty: 40, price: 500 },
                { name: 'Грунтовка', materialId: null, unit: 'л', qty: 10, price: 80 },
            ],
            [
                { materialName: 'Штукатурка', materialId: null, unit: 'меш', qty: 50, price: 100, purchaseDate: '2026-12-16' },
                { materialName: 'Штукатурка', materialId: null, unit: 'меш', qty: 50, price: 120, purchaseDate: '2026-12-17' },
                { materialName: 'Краска', materialId: null, unit: 'л', qty: 3, price: 700, purchaseDate: '2026-12-18' },
            ],
        );

        expect(rows).toHaveLength(3);
        expect(rows[0].source).toBe('estimate');
        expect(rows[0].materialName).toBe('Грунтовка');
        expect(rows[1].source).toBe('estimate');
        expect(rows[1].materialName).toBe('Штукатурка');
        expect(rows[2].source).toBe('fact_only');
        expect(rows[2].materialName).toBe('Краска');
    });

    it('merges plan/fact rows by materialId even when names differ', () => {
        const rows = buildEstimateProcurementRows(
            [{ name: 'Кабель 3х2.5', materialId: '11111111-1111-1111-1111-111111111111', unit: 'м', qty: 100, price: 50 }],
            [{ materialName: 'Кабель 3*2,5', materialId: '11111111-1111-1111-1111-111111111111', unit: 'м', qty: 70, price: 60, purchaseDate: '2026-12-17' }],
        );

        expect(rows).toHaveLength(1);
        expect(rows[0]).toMatchObject({
            source: 'estimate',
            materialName: 'Кабель 3х2.5',
            plannedQty: 100,
            actualQty: 70,
            purchaseCount: 1,
        });
    });
});

describe('shouldRefreshProcurementCache', () => {
    it('refreshes when cache has rows but source rows were deleted', () => {
        expect(
            shouldRefreshProcurementCache({
                cacheHasRows: true,
                maxRefreshedAt: new Date('2026-01-10T12:00:00.000Z'),
                latestSourceAt: null,
            }),
        ).toBe(true);
    });

    it('does not refresh repeatedly when both cache and sources are empty', () => {
        expect(
            shouldRefreshProcurementCache({
                cacheHasRows: false,
                maxRefreshedAt: null,
                latestSourceAt: null,
            }),
        ).toBe(false);
    });

    it('refreshes when sources are newer than cache', () => {
        expect(
            shouldRefreshProcurementCache({
                cacheHasRows: true,
                maxRefreshedAt: new Date('2026-01-10T12:00:00.000Z'),
                latestSourceAt: new Date('2026-01-10T12:00:01.000Z'),
            }),
        ).toBe(true);
    });
});
