import { describe, expect, it } from 'vitest';
import { buildExtraWorkFromCatalog } from '@/features/projects/estimates/lib/execution-extra-work';

describe('buildExtraWorkFromCatalog', () => {
    it('maps catalog fields to execution extra work payload', () => {
        const payload = buildExtraWorkFromCatalog({
            id: '1',
            code: 'A-12',
            name: 'Монтаж',
            unit: 'м2',
            price: 1250.5,
        });

        expect(payload).toEqual({
            name: 'Монтаж',
            code: 'A-12',
            unit: 'м2',
            actualQty: 1,
            actualPrice: 1250.5,
        });
    });

    it('falls back to defaults for missing/invalid values', () => {
        const payload = buildExtraWorkFromCatalog({
            id: '1',
            code: '',
            name: 'Работа',
            unit: '',
            price: Number.NaN,
        });

        expect(payload).toEqual({
            name: 'Работа',
            code: undefined,
            unit: 'шт',
            actualQty: 1,
            actualPrice: 0,
        });
    });
});
