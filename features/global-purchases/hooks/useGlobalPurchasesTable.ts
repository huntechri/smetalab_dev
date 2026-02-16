'use client';

import { useCallback, useMemo, useState } from 'react';
import type { CatalogMaterial } from '@/features/catalog/types/dto';
import { patchPurchaseRow } from '../lib/rows';
import { globalPurchasesActionRepo } from '../repository/global-purchases.actions';
import type { PurchaseRow, PurchaseRowPatch, PurchaseRowsRange } from '../types/dto';

export function useGlobalPurchasesTable(initialRows: PurchaseRow[], initialRange: PurchaseRowsRange) {
    const [rows, setRows] = useState<PurchaseRow[]>(initialRows);
    const [range, setRange] = useState<PurchaseRowsRange>(initialRange);

    const reloadRows = useCallback(async (nextRange: PurchaseRowsRange) => {
        const loadedRows = await globalPurchasesActionRepo.list(nextRange);
        setRows(loadedRows);
    }, []);

    const addManualRow = useCallback(async (projectId: string | null) => {
        const created = await globalPurchasesActionRepo.addManual(projectId, range.from);
        setRows((prev) => [created, ...prev]);
        return created;
    }, [range.from]);

    const addCatalogRow = useCallback(async (material: CatalogMaterial, projectId: string | null) => {
        const created = await globalPurchasesActionRepo.addFromCatalog(material, projectId, range.from);
        setRows((prev) => [created, ...prev]);
        return created;
    }, [range.from]);

    const updateRow = useCallback(async (rowId: string, patch: PurchaseRowPatch) => {
        let prevRow: PurchaseRow | null = null;

        setRows((current) => {
            const existing = current.find((row) => row.id === rowId);
            if (!existing) {
                return current;
            }

            prevRow = existing;
            return current.map((row) => (row.id === rowId ? patchPurchaseRow(row, patch) : row));
        });

        if (!prevRow) {
            return;
        }

        try {
            const updated = await globalPurchasesActionRepo.patch(rowId, patch);
            setRows((current) => current.map((row) => (row.id === rowId ? updated : row)));
        } catch (serviceError) {
            setRows((current) => current.map((row) => (row.id === rowId && prevRow ? prevRow : row)));
            throw serviceError;
        }
    }, []);

    const removeRow = useCallback(async (rowId: string) => {
        let removedRow: PurchaseRow | null = null;
        let removedIndex = -1;

        setRows((current) => {
            removedIndex = current.findIndex((row) => row.id === rowId);
            if (removedIndex < 0) {
                return current;
            }

            removedRow = current[removedIndex] ?? null;
            return current.filter((row) => row.id !== rowId);
        });

        if (!removedRow || removedIndex < 0) {
            return;
        }

        try {
            await globalPurchasesActionRepo.remove(rowId);
        } catch (serviceError) {
            setRows((current) => {
                if (current.some((row) => row.id === rowId)) {
                    return current;
                }

                const nextRows = [...current];
                const insertIndex = Math.min(removedIndex, nextRows.length);
                nextRows.splice(insertIndex, 0, removedRow as PurchaseRow);
                return nextRows;
            });
            throw serviceError;
        }
    }, []);

    const totals = useMemo(() => rows.reduce((acc, row) => {
        acc.amount += row.amount;
        return acc;
    }, { amount: 0 }), [rows]);

    const addedMaterialNames = useMemo(() => new Set(rows.map((row) => row.materialName).filter(Boolean)), [rows]);

    return {
        rows,
        range,
        setRange,
        reloadRows,
        addManualRow,
        addCatalogRow,
        updateRow,
        removeRow,
        totals,
        addedMaterialNames,
    };
}
