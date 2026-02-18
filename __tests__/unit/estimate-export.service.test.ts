import { describe, expect, it } from 'vitest';
import { EstimateExportService, __estimateExportServiceInternal } from '@/lib/services/estimate-export.service';

describe('EstimateExportService', () => {
    it('validates supported export formats', () => {
        const xlsx = EstimateExportService.validateFormat('xlsx');
        const pdf = EstimateExportService.validateFormat('pdf');
        const bad = EstimateExportService.validateFormat('csv');

        expect(xlsx.success).toBe(true);
        expect(pdf.success).toBe(true);
        expect(bad.success).toBe(false);
    });

    it('computes separate totals for works and materials', () => {
        const totals = __estimateExportServiceInternal.computeTotals([
            {
                id: '1',
                kind: 'work',
                parentWorkId: null,
                code: '1',
                name: 'Штукатурка',
                imageUrl: null,
                unit: 'м2',
                qty: 10,
                price: 100,
                sum: 1000,
                expense: 0,
                order: 100,
            },
            {
                id: '2',
                kind: 'material',
                parentWorkId: '1',
                code: '1.1',
                name: 'Смесь',
                imageUrl: 'https://example.com/a.jpg',
                unit: 'меш',
                qty: 3,
                price: 500,
                sum: 1500,
                expense: 0.3,
                order: 110,
            },
        ]);

        expect(totals).toEqual({
            works: 1000,
            materials: 1500,
            grand: 2500,
        });
    });

    it('builds deterministic export file name', () => {
        const name = EstimateExportService.buildFilename({
            estimateId: 'id',
            estimateName: 'Смета Черновая 1',
            projectName: 'ЖК Остров B35',
            rows: [],
            totals: { works: 0, materials: 0, grand: 0 },
        }, 'xlsx');

        expect(name.endsWith('.xlsx')).toBe(true);
        expect(name).toContain('жк-остров-b35');
    });
});
