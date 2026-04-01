import { describe, expect, it } from 'vitest';
import {
  buildEstimateExecutionExportRows,
  buildEstimateProcurementExportRows,
} from '@/features/projects/estimates/lib/tab-export';

describe('estimate tab export mappers', () => {
  it('maps procurement rows with all export columns', () => {
    const rows = buildEstimateProcurementExportRows([
      {
        materialName: 'Клей плиточный',
        unit: 'меш',
        source: 'estimate',
        plannedQty: 10,
        plannedPrice: 420,
        plannedAmount: 4200,
        actualQty: 8,
        actualAvgPrice: 430,
        actualAmount: 3440,
        qtyDelta: 2,
        amountDelta: 760,
        purchaseCount: 3,
        lastPurchaseDate: '2026-03-15',
      },
    ]);

    expect(rows).toEqual([
      {
        'Материал': 'Клей плиточный',
        'Ед.': 'меш',
        'Источник': 'estimate',
        'План Кол-во': 10,
        'План Цена': 420,
        'План Сумма': 4200,
        'Факт Кол-во': 8,
        'Факт Ср. цена': 430,
        'Факт Сумма': 3440,
        'Δ Кол-во': 2,
        'Δ Сумма': 760,
        'Кол-во закупок': 3,
        'Дата последней закупки': '2026-03-15',
      },
    ]);
  });

  it('maps execution rows with all export columns', () => {
    const rows = buildEstimateExecutionExportRows([
      {
        id: '11111111-1111-1111-1111-111111111111',
        estimateRowId: null,
        source: 'extra',
        status: 'in_progress',
        code: 'Доп-1',
        name: 'Разгрузка материалов',
        unit: 'ч',
        plannedQty: 0,
        plannedPrice: 0,
        plannedSum: 0,
        actualQty: 4,
        actualPrice: 2500,
        actualSum: 10000,
        isCompleted: false,
        order: 900,
      },
    ]);

    expect(rows).toEqual([
      {
        'ID': '11111111-1111-1111-1111-111111111111',
        'Estimate Row ID': '',
        'Источник': 'extra',
        'Статус': 'in_progress',
        'Код': 'Доп-1',
        'Наименование': 'Разгрузка материалов',
        'Ед.': 'ч',
        'План Кол-во': 0,
        'План Цена': 0,
        'План Сумма': 0,
        'Факт Кол-во': 4,
        'Факт Цена': 2500,
        'Факт Сумма': 10000,
        'Завершено': 'Нет',
        'Порядок': 900,
      },
    ]);
  });
});
