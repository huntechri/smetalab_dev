import { describe, expect, it } from 'vitest';
import { exportGlobalPurchasesCsv, parseGlobalPurchasesCsv } from '@/features/global-purchases/lib/import-export';

describe('global purchases import/export csv', () => {
    it('exports rows to csv with expected headers', () => {
        const csv = exportGlobalPurchasesCsv([{
            purchaseDate: '2026-02-12',
            projectName: 'ЖК Мечта',
            materialName: 'Цемент М500',
            unit: 'мешок',
            qty: 4,
            price: 510,
            note: 'Для фундамента',
            supplierName: 'БетонМаркет',
        }]);

        expect(csv).toContain('Дата;Объект;Материал;Ед.;Кол-во;Цена;Сумма;Поставщик;Примечание');
        expect(csv).toContain('2026-02-12;ЖК Мечта;Цемент М500;мешок;4;510;2040;БетонМаркет;Для фундамента');
    });

    it('parses csv rows into typed rows', () => {
        const parsed = parseGlobalPurchasesCsv([
            'Дата;Объект;Материал;Ед.;Кол-во;Цена;Сумма;Поставщик;Примечание',
            '2026-02-12;ЖК Мечта;Цемент М500;мешок;4;510;2040;БетонМаркет;Для фундамента',
        ].join('\n'));

        expect(parsed).toEqual([{
            purchaseDate: '2026-02-12',
            projectName: 'ЖК Мечта',
            materialName: 'Цемент М500',
            unit: 'мешок',
            qty: 4,
            price: 510,
            note: 'Для фундамента',
            supplierName: 'БетонМаркет',
        }]);
    });

    it('throws for invalid csv headers', () => {
        expect(() => parseGlobalPurchasesCsv('foo;bar\n1;2')).toThrow('Некорректный формат CSV');
    });
});

