'use client';

import { useCallback, useMemo, useState } from 'react';
import type { CatalogMaterial } from '@/features/catalog/types/dto';
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

    const copyRowsToNextDay = useCallback(async () => {
        const sourceDate = range.from;
        const source = new Date(sourceDate);
        source.setDate(source.getDate() + 1);
        const targetDate = source.toISOString().slice(0, 10);
        const createdRows = await globalPurchasesActionRepo.copyDay(sourceDate, targetDate);

        const nextRange = { from: targetDate, to: targetDate };
        setRange(nextRange);
        await reloadRows(nextRange);

        return { createdRows, targetDate };
    }, [range.from, reloadRows]);

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
        range,
        setRange,
        reloadRows,
        addManualRow,
        addCatalogRow,
        updateRow,
        copyRowsToNextDay,
        removeRow,
        totals,
        addedMaterialNames,
    };
}
