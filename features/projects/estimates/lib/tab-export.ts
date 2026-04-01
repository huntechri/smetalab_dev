'use client';

import * as XLSX from 'xlsx';
import { EstimateExecutionRow } from '@/features/projects/estimates/types/execution.dto';
import { EstimateProcurementRow } from '@/lib/services/estimate-procurement.service';

const pad = (value: number) => String(value).padStart(2, '0');

const buildTimestamp = (date: Date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}_${hours}-${minutes}`;
};

export const buildEstimateProcurementExportRows = (rows: EstimateProcurementRow[]) => (
  rows.map((row) => ({
    'Материал': row.materialName,
    'Ед.': row.unit,
    'Источник': row.source,
    'План Кол-во': row.plannedQty,
    'План Цена': row.plannedPrice,
    'План Сумма': row.plannedAmount,
    'Факт Кол-во': row.actualQty,
    'Факт Ср. цена': row.actualAvgPrice,
    'Факт Сумма': row.actualAmount,
    'Δ Кол-во': row.qtyDelta,
    'Δ Сумма': row.amountDelta,
    'Кол-во закупок': row.purchaseCount,
    'Дата последней закупки': row.lastPurchaseDate ?? '',
  }))
);

export const buildEstimateExecutionExportRows = (rows: EstimateExecutionRow[]) => (
  rows.map((row) => ({
    'ID': row.id,
    'Estimate Row ID': row.estimateRowId ?? '',
    'Источник': row.source,
    'Статус': row.status,
    'Код': row.code,
    'Наименование': row.name,
    'Ед.': row.unit,
    'План Кол-во': row.plannedQty,
    'План Цена': row.plannedPrice,
    'План Сумма': row.plannedSum,
    'Факт Кол-во': row.actualQty,
    'Факт Цена': row.actualPrice,
    'Факт Сумма': row.actualSum,
    'Завершено': row.isCompleted ? 'Да' : 'Нет',
    'Порядок': row.order,
  }))
);

export const downloadEstimateProcurementXlsx = (rows: EstimateProcurementRow[], estimateId: string) => {
  const worksheet = XLSX.utils.json_to_sheet(buildEstimateProcurementExportRows(rows));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Procurement');
  XLSX.writeFile(workbook, `estimate_${estimateId}_procurement_${buildTimestamp(new Date())}.xlsx`);
};

export const downloadEstimateExecutionXlsx = (rows: EstimateExecutionRow[], estimateId: string) => {
  const worksheet = XLSX.utils.json_to_sheet(buildEstimateExecutionExportRows(rows));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Execution');
  XLSX.writeFile(workbook, `estimate_${estimateId}_execution_${buildTimestamp(new Date())}.xlsx`);
};
