import { describe, expect, it, vi, beforeEach } from 'vitest';
import ExcelJS from 'exceljs';
import { EstimateTabExportService } from '@/lib/services/estimate-tab-export.service';
import { EstimateProcurementService } from '@/lib/services/estimate-procurement.service';
import { EstimateExecutionService } from '@/lib/services/estimate-execution.service';

describe('EstimateTabExportService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exports procurement xlsx with visible columns only', async () => {
    vi.spyOn(EstimateProcurementService, 'list').mockResolvedValue({
      success: true,
      data: [
        {
          materialName: 'Клей',
          unit: 'шт',
          source: 'estimate',
          plannedQty: 5,
          plannedPrice: 100,
          plannedAmount: 500,
          actualQty: 3,
          actualAvgPrice: 110,
          actualAmount: 330,
          qtyDelta: 2,
          amountDelta: 170,
          purchaseCount: 1,
          lastPurchaseDate: '2026-03-01',
        },
      ],
    });

    const result = await EstimateTabExportService.exportProcurementXlsx(1, 'estimate-1');
    expect(result.success).toBe(true);
    if (!result.success) return;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(result.data.buffer);
    const sheet = workbook.getWorksheet('Закупки');
    expect(sheet).toBeDefined();

    const header = sheet!.getRow(1).values as Array<string | undefined>;
    expect(header.slice(1)).toEqual([
      'Материал', 'Ед.', 'Кол-во', 'Цена', 'Сумма', 'ф. Кол-во', 'Ср. цена', 'ф. Сумма', 'Δ Кол-во', 'Δ Сумма',
    ]);

    const row = sheet!.getRow(2).values as Array<string | number | undefined>;
    expect(row[1]).toBe('Клей');
    expect(row[2]).toBe('шт');
    expect(row[10]).toBe(170);
  });

  it('exports execution xlsx with visible columns only', async () => {
    vi.spyOn(EstimateExecutionService, 'list').mockResolvedValue({
      success: true,
      data: [
        {
          id: '11111111-1111-1111-1111-111111111111',
          estimateRowId: null,
          source: 'extra',
          status: 'in_progress',
          code: 'Доп-1',
          name: 'Разгрузка',
          unit: 'ч',
          plannedQty: 0,
          plannedPrice: 0,
          plannedSum: 0,
          actualQty: 2,
          actualPrice: 1000,
          actualSum: 2000,
          isCompleted: false,
          order: 100,
        },
      ],
    });

    const result = await EstimateTabExportService.exportExecutionXlsx(1, 'estimate-1');
    expect(result.success).toBe(true);
    if (!result.success) return;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(result.data.buffer);
    const sheet = workbook.getWorksheet('Выполнение');
    expect(sheet).toBeDefined();

    const header = sheet!.getRow(1).values as Array<string | undefined>;
    expect(header.slice(1)).toEqual([
      'Код', 'Работа', 'Ед.', 'Кол-во', 'Цена', 'План сумма', 'Факт кол-во', 'Факт цена', 'Факт сумма', 'Статус',
    ]);

    const row = sheet!.getRow(2).values as Array<string | number | undefined>;
    expect(row[1]).toBe('Доп-1');
    expect(row[2]).toBe('Разгрузка');
    expect(row[10]).toBe('В процессе');
  });
});
