'use client';

import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import type { ImportablePurchaseRow } from '../lib/import-export';
import { exportGlobalPurchasesXlsx, parseGlobalPurchasesImportFile } from '../lib/import-export';
import type { PurchaseRow, PurchaseRowsRange } from '../types/dto';

type ToastPayload = {
  variant?: 'default' | 'destructive';
  title: string;
  description?: string;
};

interface UseGlobalPurchasesImportExportOptions {
  displayedRows: PurchaseRow[];
  range: PurchaseRowsRange;
  importRows: (rows: ImportablePurchaseRow[]) => Promise<unknown>;
  toast: (payload: ToastPayload) => void;
}

export function useGlobalPurchasesImportExport({ displayedRows, range, importRows, toast }: UseGlobalPurchasesImportExportOptions) {
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = async () => {
    try {
      const xlsxBuffer = await exportGlobalPurchasesXlsx(displayedRows.map((row) => ({
        purchaseDate: row.purchaseDate,
        projectName: row.projectName,
        materialName: row.materialName,
        unit: row.unit,
        qty: row.qty,
        price: row.price,
        note: row.note,
        supplierName: row.supplierName ?? '',
        supplierColor: row.supplierColor,
      })));

      const blob = new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `global-purchases-${range.from}_${range.to}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);

      toast({ title: 'Экспорт завершен', description: `Экспортировано строк: ${displayedRows.length}.` });
    } catch {
      toast({ variant: 'destructive', title: 'Ошибка экспорта', description: 'Не удалось подготовить XLSX файл.' });
    }
  };

  const handleImportFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsedRows = await parseGlobalPurchasesImportFile(file);
      if (parsedRows.length === 0) {
        toast({ variant: 'destructive', title: 'Ошибка импорта', description: 'Файл не содержит строк для импорта.' });
        return;
      }

      await importRows(parsedRows);
      toast({ title: 'Импорт завершен', description: `Импортировано строк: ${parsedRows.length}.` });
    } catch (importError) {
      const description = importError instanceof Error ? importError.message : 'Не удалось импортировать файл.';
      toast({ variant: 'destructive', title: 'Ошибка импорта', description });
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  return {
    importInputRef,
    handleExport,
    handleImportClick,
    handleImportFileChange,
  };
}
