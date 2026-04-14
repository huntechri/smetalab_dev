import { describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import { exportGlobalPurchasesCsv, exportGlobalPurchasesXlsx, parseGlobalPurchasesCsv, parseGlobalPurchasesXlsx } from '@/features/global-purchases/lib/import-export';

describe('global purchases import/export csv', () => {
    it('exports rows to csv with expected headers', () => {
        const csv = exportGlobalPurchasesCsv([{
            purchaseDate: '2026-02-12',
            projectName: 'ЖК Мечта',
            materialName: 'Цемент М500',
            materialId: '6b6af2f8-6d00-4d3b-9f45-34f65ce969ad',
            unit: 'мешок',
            qty: 4,
            price: 510,
            note: 'Для фундамента',
            supplierName: 'БетонМаркет',
        }]);

        expect(csv).toContain('Дата;Объект;Материал;ID материала;Ед.;Кол-во;Цена;Сумма;Поставщик;Примечание');
        expect(csv).toContain('2026-02-12;ЖК Мечта;Цемент М500;6b6af2f8-6d00-4d3b-9f45-34f65ce969ad;мешок;4;510;2040;БетонМаркет;Для фундамента');
    });

    it('parses csv rows into typed rows', () => {
        const parsed = parseGlobalPurchasesCsv([
            'Дата;Объект;Материал;ID материала;Ед.;Кол-во;Цена;Сумма;Поставщик;Примечание',
            '2026-02-12;ЖК Мечта;Цемент М500;6b6af2f8-6d00-4d3b-9f45-34f65ce969ad;мешок;4;510;2040;БетонМаркет;Для фундамента',
        ].join('\n'));

        expect(parsed).toEqual([{
            purchaseDate: '2026-02-12',
            projectName: 'ЖК Мечта',
            materialName: 'Цемент М500',
            materialId: '6b6af2f8-6d00-4d3b-9f45-34f65ce969ad',
            unit: 'мешок',
            qty: 4,
            price: 510,
            note: 'Для фундамента',
            supplierName: 'БетонМаркет',
        }]);
    });

    it('parses csv with exported material header alias', () => {
        const parsed = parseGlobalPurchasesCsv([
            'Дата;Объект;Наименование материала;ID материала;Ед.;Кол-во;Цена;Сумма;Поставщик;Примечание',
            '2026-02-12;ЖК Мечта;Цемент М500;6b6af2f8-6d00-4d3b-9f45-34f65ce969ad;мешок;4;510;2040;БетонМаркет;Для фундамента',
        ].join('\n'));

        expect(parsed[0]).toMatchObject({
            purchaseDate: '2026-02-12',
            projectName: 'ЖК Мечта',
            materialName: 'Цемент М500',
            materialId: '6b6af2f8-6d00-4d3b-9f45-34f65ce969ad',
            supplierName: 'БетонМаркет',
        });
    });

    it('throws for invalid csv headers', () => {
        expect(() => parseGlobalPurchasesCsv('foo;bar\n1;2')).toThrow('Некорректный формат CSV');
    });

    it('exports styled xlsx with supplier color and spacer row between projects', async () => {
        const buffer = await exportGlobalPurchasesXlsx([
            {
                purchaseDate: '2026-02-12',
                projectName: 'ЖК Мечта',
                materialName: 'Очень длинное наименование материала для проверки переноса текста',
                materialId: '6b6af2f8-6d00-4d3b-9f45-34f65ce969ad',
                unit: 'мешок',
                qty: 4,
                price: 510,
                note: 'Для фундамента',
                supplierName: 'БетонМаркет',
                supplierColor: '#ff0000',
            },
            {
                purchaseDate: '2026-02-13',
                projectName: 'ЖК Солнце',
                materialName: 'Песок',
                materialId: null,
                unit: 'т',
                qty: 2,
                price: 1000,
                note: '',
                supplierName: 'ПесокПлюс',
                supplierColor: null,
            },
        ]);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(Buffer.from(buffer));
        const sheet = workbook.getWorksheet('Глобальные закупки');
        expect(sheet).toBeDefined();

        const materialCell = sheet?.getCell('C2');
        expect(materialCell?.alignment?.wrapText).toBe(true);
        expect(sheet?.getColumn(3).width).toBe(64);

        const supplierCell = sheet?.getCell('I2');
        expect(supplierCell?.fill).toMatchObject({
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF0000' },
        });

        const spacerRow = sheet?.getRow(3);
        expect(spacerRow?.actualCellCount ?? 0).toBe(0);

        const borderedCell = sheet?.getCell('A2');
        expect(borderedCell?.border?.top?.style).toBe('thin');
    });

    it('parses exported xlsx back into import rows including date/object/supplier', async () => {
        const buffer = await exportGlobalPurchasesXlsx([{
            purchaseDate: '2026-04-03',
            projectName: 'КВ135',
            materialName: 'Кабель ВВГнг',
            materialId: '6b6af2f8-6d00-4d3b-9f45-34f65ce969ad',
            unit: 'пог.м',
            qty: 6,
            price: 177,
            note: 'Проверка импорта',
            supplierName: 'Электрика',
            supplierColor: '#ff00ff',
        }]);

        const parsed = await parseGlobalPurchasesXlsx(buffer);

        expect(parsed).toEqual([{
            purchaseDate: '2026-04-03',
            projectName: 'КВ135',
            materialName: 'Кабель ВВГнг',
            materialId: '6b6af2f8-6d00-4d3b-9f45-34f65ce969ad',
            unit: 'пог.м',
            qty: 6,
            price: 177,
            note: 'Проверка импорта',
            supplierName: 'Электрика',
        }]);
    });
});
