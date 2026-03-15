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


    it('ignores sections in totals calculation', () => {
        const totals = __estimateExportServiceInternal.computeTotals([
            {
                id: 's1',
                kind: 'section',
                parentWorkId: null,
                code: '1',
                name: 'Раздел 1',
                imageUrl: null,
                unit: '',
                qty: 0,
                price: 0,
                sum: 0,
                expense: 0,
                order: 1,
            },
            {
                id: 'w1',
                kind: 'work',
                parentWorkId: null,
                code: '1.1',
                name: 'Работа',
                imageUrl: null,
                unit: 'м2',
                qty: 1,
                price: 100,
                sum: 100,
                expense: 0,
                order: 2,
            },
        ]);

        expect(totals).toEqual({ works: 100, materials: 0, grand: 100 });
    });


    it('computes section display totals from subsequent rows', () => {
        const totals = __estimateExportServiceInternal.computeSectionDisplayTotals([
            {
                id: 's2',
                kind: 'section',
                parentWorkId: null,
                code: '2',
                name: 'Раздел 2',
                imageUrl: null,
                unit: '',
                qty: 0,
                price: 0,
                sum: 0,
                expense: 0,
                order: 300,
            },
            {
                id: 'm2',
                kind: 'material',
                parentWorkId: 'w2',
                code: '2.1.1',
                name: 'Материал 2',
                imageUrl: null,
                unit: 'шт',
                qty: 1,
                price: 100,
                sum: 100,
                expense: 0,
                order: 320,
            },
            {
                id: 'w1',
                kind: 'work',
                parentWorkId: null,
                code: '1.1',
                name: 'Работа 1',
                imageUrl: null,
                unit: 'м2',
                qty: 1,
                price: 200,
                sum: 200,
                expense: 0,
                order: 120,
            },
            {
                id: 's1',
                kind: 'section',
                parentWorkId: null,
                code: '1',
                name: 'Раздел 1',
                imageUrl: null,
                unit: '',
                qty: 0,
                price: 0,
                sum: 0,
                expense: 0,
                order: 100,
            },
            {
                id: 'w2',
                kind: 'work',
                parentWorkId: null,
                code: '2.1',
                name: 'Работа 2',
                imageUrl: null,
                unit: 'м2',
                qty: 1,
                price: 300,
                sum: 300,
                expense: 0,
                order: 310,
            },
        ]);

        expect(totals.rowSumById.get('s1')).toBe(200);
        expect(totals.rowSumById.get('s2')).toBe(400);
        expect(totals.rowSumById.get('w1')).toBe(200);
        expect(totals.rowSumById.get('w2')).toBe(300);
        expect(totals.rowSumById.get('m2')).toBe(100);
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
        expect(name).toContain('zhk-ostrov-b35');
    });

    it('exports xlsx without expense column', async () => {
        const buffer = await EstimateExportService.exportXlsx({
            estimateId: 'id',
            estimateName: 'Смета',
            projectName: 'Проект',
            rows: [
                {
                    id: 's1',
                    kind: 'section',
                    parentWorkId: null,
                    code: '1',
                    name: 'Раздел 1',
                    imageUrl: null,
                    unit: '',
                    qty: 0,
                    price: 0,
                    sum: 0,
                    expense: 0,
                    order: 90,
                },
                {
                    id: '1',
                    kind: 'work',
                    parentWorkId: null,
                    code: '1',
                    name: 'Работа',
                    imageUrl: null,
                    unit: 'м2',
                    qty: 2,
                    price: 100,
                    sum: 200,
                    expense: 0,
                    order: 100,
                },
            ],
            totals: { works: 200, materials: 0, grand: 200 },
        });

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const sheet = workbook.getWorksheet('Смета');
        const headers = sheet?.getRow(4).values as Array<string | number | null | undefined>;
        const sectionSum = sheet?.getRow(5).getCell(8).value;

        expect(headers).not.toContain('Расход');
        expect(sectionSum).toBe(200);
    });

    it('exports pdf for cyrillic names', async () => {
        const buffer = await EstimateExportService.exportPdf({
            estimateId: 'id',
            estimateName: 'Смета Тест',
            projectName: 'Проект Тест',
            rows: [
                {
                    id: 's1',
                    kind: 'section',
                    parentWorkId: null,
                    code: '1',
                    name: 'Раздел 1',
                    imageUrl: null,
                    unit: '',
                    qty: 0,
                    price: 0,
                    sum: 0,
                    expense: 0,
                    order: 90,
                },
                {
                    id: '1',
                    kind: 'work',
                    parentWorkId: null,
                    code: '1',
                    name: 'Штукатурка',
                    imageUrl: null,
                    unit: 'м2',
                    qty: 2,
                    price: 100,
                    sum: 200,
                    expense: 0,
                    order: 100,
                },
            ],
            totals: { works: 200, materials: 0, grand: 200 },
        });

        expect(buffer.subarray(0, 4).toString('utf8')).toBe('%PDF');
    });

});
