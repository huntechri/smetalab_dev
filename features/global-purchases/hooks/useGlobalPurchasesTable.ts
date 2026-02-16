'use client';

import { useCallback, useMemo, useState } from 'react';
import type { CatalogMaterial } from '@/features/catalog/types/dto';
import { globalPurchasesActionRepo } from '../repository/global-purchases.actions';
import type { PurchaseRow, PurchaseRowPatch } from '../types/dto';

export function useGlobalPurchasesTable(initialRows: PurchaseRow[]) {
    const [rows, setRows] = useState<PurchaseRow[]>(initialRows);

    const addManualRow = useCallback(async (projectName: string) => {
        const created = await globalPurchasesActionRepo.addManual(projectName);
        setRows((prev) => [created, ...prev]);
        return created;
    }, []);

    const addCatalogRow = useCallback(async (material: CatalogMaterial, projectName: string) => {
        const created = await globalPurchasesActionRepo.addFromCatalog(material, projectName);
        setRows((prev) => [created, ...prev]);
        return created;
    }, []);

    const updateRow = useCallback(async (rowId: string, patch: PurchaseRowPatch) => {
        const existing = rows.find((row) => row.id === rowId);
        if (!existing) {
            return;
        }

        const optimisticRows = rows.map((row) => {
            if (row.id !== rowId) {
                return row;
            }

            const nextQty = patch.qty ?? row.qty;
            const nextPrice = patch.price ?? row.price;
            const amount = Math.round((nextQty * nextPrice + Number.EPSILON) * 100) / 100;

            return {
                ...row,
                ...patch,
                qty: nextQty,
                price: nextPrice,
                amount,
            };
        });

        setRows(optimisticRows);

        try {
            const updated = await globalPurchasesActionRepo.patch(rowId, patch);
            setRows((current) => current.map((row) => (row.id === rowId ? updated : row)));
        } catch (serviceError) {
            setRows(rows);
            throw serviceError;
        }
    }, [rows]);

    const removeRow = useCallback(async (rowId: string) => {
        const prevRows = rows;
        setRows((current) => current.filter((row) => row.id !== rowId));

        try {
            await globalPurchasesActionRepo.remove(rowId);
        } catch (serviceError) {
            setRows(prevRows);
            throw serviceError;
        }
    }, [rows]);

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
