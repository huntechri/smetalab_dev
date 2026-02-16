import { describe, expect, it } from 'vitest';
import {
    calculatePurchaseAmount,
    createCatalogPurchaseRow,
    createManualPurchaseRow,
    patchPurchaseRow,
    purchaseRowSchema,
} from '@/features/global-purchases/lib/rows';

describe('global purchases row helpers', () => {
    it('creates manual row with safe defaults', () => {
        const row = createManualPurchaseRow({ projectName: 'ЖК Сканди' });

        expect(row.projectName).toBe('ЖК Сканди');
        expect(row.materialName).toBe('');
        expect(row.qty).toBe(1);
        expect(row.price).toBe(0);
        expect(row.amount).toBe(0);
        expect(row.source).toBe('manual');
    });

    it('creates catalog row and calculates amount', () => {
        const row = createCatalogPurchaseRow({
            id: 'mat-1',
            name: 'Цемент М500',
            code: 'CM-500',
            unit: 'мешок',
            price: 420,
        }, 'ЖК Речной');

        expect(row.projectName).toBe('ЖК Речной');
        expect(row.materialName).toBe('Цемент М500');
        expect(row.unit).toBe('мешок');
        expect(row.price).toBe(420);
        expect(row.amount).toBe(420);
        expect(row.source).toBe('catalog');
    });

    it('patches row and recalculates amount', () => {
        const row = createManualPurchaseRow();
        const patched = patchPurchaseRow(row, {
            materialName: 'Песок',
            qty: 3,
            price: 200,
            note: 'Срочно',
        });

        expect(patched.materialName).toBe('Песок');
        expect(patched.amount).toBe(600);
        expect(patched.note).toBe('Срочно');
    });

    it('fails schema validation for negative qty', () => {
        const result = purchaseRowSchema.safeParse({
            id: '1',
            projectName: 'Объект',
            materialName: 'Материал',
            unit: 'шт',
            qty: -1,
            price: 100,
            amount: -100,
            note: '',
            source: 'manual',
        });

        expect(result.success).toBe(false);
    });

    it('calculates amount with cents precision', () => {
        expect(calculatePurchaseAmount(2.5, 19.99)).toBe(49.97);
    });
});
