'use client';

import { useCallback, useMemo, useState } from 'react';
import type { CatalogMaterial } from '@/features/catalog/types/dto';
import {
    createCatalogPurchaseRow,
    createManualPurchaseRow,
    patchPurchaseRow,
} from '../lib/rows';
import type { PurchaseRow, PurchaseRowPatch } from '../types/dto';

export function useGlobalPurchasesTable(initialRows: PurchaseRow[]) {
    const [rows, setRows] = useState<PurchaseRow[]>(initialRows);

    const addManualRow = useCallback((projectName: string) => {
        setRows((prev) => [createManualPurchaseRow({ projectName }), ...prev]);
    }, []);

    const addCatalogRow = useCallback((material: CatalogMaterial, projectName: string) => {
        setRows((prev) => [createCatalogPurchaseRow(material, projectName), ...prev]);
    }, []);

    const updateRow = useCallback((rowId: string, patch: PurchaseRowPatch) => {
        setRows((prev) => prev.map((row) => {
            if (row.id !== rowId) {
                return row;
            }

            return patchPurchaseRow(row, patch);
        }));
    }, []);

    const removeRow = useCallback((rowId: string) => {
        setRows((prev) => prev.filter((row) => row.id !== rowId));
    }, []);

    const totals = useMemo(() => rows.reduce((acc, row) => {
        acc.amount += row.amount;
        return acc;
    }, { amount: 0 }), [rows]);

    const addedMaterialNames = useMemo(() => new Set(rows.map((row) => row.materialName).filter(Boolean)), [rows]);

    return {
        rows,
        addManualRow,
        addCatalogRow,
        updateRow,
        removeRow,
        totals,
        addedMaterialNames,
    };
}
