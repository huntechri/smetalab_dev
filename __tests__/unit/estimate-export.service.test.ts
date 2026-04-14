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

        expect(totals.bySectionId.get('s1')).toEqual({ works: 200, materials: 0, total: 200 });
        expect(totals.bySectionId.get('s2')).toEqual({ works: 300, materials: 100, total: 400 });
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
            exportDate: '01.01.2026',
            customerName: 'Заказчик',
            contractorName: 'Подрядчик',
            objectAddress: 'Адрес',
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
            exportDate: '01.01.2026',
            customerName: 'ООО Заказчик',
            contractorName: 'ООО Подрядчик',
            objectAddress: 'г. Москва, ул. Тестовая, 1',
            rows: [
                {
                    id: 's1',
                    kind: 'section',
                    parentWorkId: null,
                    code: 'S-001',
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
                    id: 'work-db-id',
                    kind: 'work',
                    parentWorkId: null,
                    code: 'W-001',
                    name: 'Работа',
                    imageUrl: null,
                    unit: 'м2',
                    qty: 2,
                    price: 100,
                    sum: 200,
                    expense: 0,
                    order: 100,
                },
                {
                    id: 'material-db-id',
                    kind: 'material',
                    parentWorkId: 'work-db-id',
                    code: 'M-001',
                    name: 'Материал',
                    imageUrl: null,
                    unit: 'шт',
                    qty: 4,
                    price: 50,
                    sum: 200,
                    expense: 0,
                    order: 110,
                },
            ],
            totals: { works: 200, materials: 200, grand: 400 },
        });

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const sheet = workbook.getWorksheet('Смета');
        const headers = sheet?.getRow(12).values as Array<string | number | null | undefined>;
        const technicalCodeHeader = sheet?.getRow(12).getCell(1).value;
        const technicalCodeValue = sheet?.getRow(14).getCell(1).value;
        const technicalColumnHidden = sheet?.getColumn(1).hidden;
        const sectionSum = sheet?.getRow(13).getCell(9).value;
        const workRowSum = sheet?.getRow(14).getCell(9).value as { formula?: string } | null;
        const materialRowSum = sheet?.getRow(15).getCell(9).value as { formula?: string } | null;
        const sectionWorksLabel = sheet?.getRow(16).getCell(4).value;
        const sectionWorksSum = sheet?.getRow(16).getCell(9).value as { formula?: string } | null;
        const sectionMaterialsLabel = sheet?.getRow(17).getCell(4).value;
        const sectionMaterialsSum = sheet?.getRow(17).getCell(9).value as { formula?: string } | null;
        const sectionSummaryTitle = sheet?.getRow(19).getCell(4).value;
        const sectionSummaryWorksLabel = sheet?.getRow(20).getCell(4).value;
        const sectionSummaryWorksTotal = sheet?.getRow(20).getCell(9).value as { formula?: string } | null;
        const sectionSummaryMaterialsLabel = sheet?.getRow(21).getCell(4).value;
        const sectionSummaryMaterialsTotal = sheet?.getRow(21).getCell(9).value as { formula?: string } | null;
        const workRowHeight = sheet?.getRow(14).height;
        const projectCell = sheet?.getCell('B6').value;
        const dateCell = sheet?.getCell('F6').value;
        const customerCell = sheet?.getCell('B7').value;
        const contractorCell = sheet?.getCell('B8').value;
        const addressCell = sheet?.getCell('B9').value;
        const contractCell = sheet?.getCell('B10').value;

        expect(headers).not.toContain('Расход');
        expect(technicalCodeHeader).toBe('КОД');
        expect(technicalCodeValue).toBe('W-001');
        expect(technicalColumnHidden).toBe(true);
        expect(headers).toContain('Изображение');
        expect(projectCell).toBe('Проект: Проект');
        expect(dateCell).toBe('Дата: 01.01.2026');
        expect(customerCell).toBe('Заказчик: ООО Заказчик');
        expect(contractorCell).toBe('Подрядчик: ООО Подрядчик');
        expect(addressCell).toBe('Адрес объекта: г. Москва, ул. Тестовая, 1');
        expect(contractCell).toBe('Договор №: ');
        expect(sectionSum).toBe('');
        expect(sheet?.getRow(14).getCell(2).value).toBe('W-001');
        expect(workRowSum?.formula).toBe('G14*H14');
        expect(materialRowSum?.formula).toBe('G15*H15');
        expect(workRowHeight).toBeGreaterThanOrEqual(24);
        expect(sectionWorksLabel).toBe('Итого по разделу № S-001 (работы)');
        expect(sectionWorksSum?.formula).toContain('SUMIFS');
        expect(sectionWorksSum?.formula).toContain('"Работа"');
        expect(sectionMaterialsLabel).toBe('Итого по разделу № S-001 (материал)');
        expect(sectionMaterialsSum?.formula).toContain('SUMIFS');
        expect(sectionMaterialsSum?.formula).toContain('"Материал"');
        expect(sectionSummaryTitle).toBe('Общие итоги по разделам');
        expect(sectionSummaryWorksLabel).toBe('Итого раздела № S-001 (работы)');
        expect(sectionSummaryWorksTotal?.formula).toBe('SUMIFS($I$14:$I$15,$C$14:$C$15,"Работа")');
        expect(sectionSummaryMaterialsLabel).toBe('Итого раздела № S-001 (материалы)');
        expect(sectionSummaryMaterialsTotal?.formula).toBe('SUMIFS($I$14:$I$15,$C$14:$C$15,"Материал")');
    });

    it('exports pdf for cyrillic names', async () => {
        const buffer = await EstimateExportService.exportPdf({
            estimateId: 'id',
            estimateName: 'Смета Тест',
            projectName: 'Проект Тест',
            exportDate: '01.01.2026',
            customerName: 'ООО Заказчик',
            contractorName: 'ООО Подрядчик',
            objectAddress: 'г. Москва, ул. Пушкина, д. 1',
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
