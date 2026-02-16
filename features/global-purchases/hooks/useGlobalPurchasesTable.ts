'use client';

import { useCallback, useMemo, useState } from 'react';
import type { CatalogMaterial } from '@/features/catalog/types/dto';
import { patchPurchaseRow } from '../lib/rows';
import { globalPurchasesActionRepo } from '../repository/global-purchases.actions';
import type { PurchaseRow, PurchaseRowPatch, PurchaseRowsRange } from '../types/dto';

const sortRowsByProjectId = (rows: PurchaseRow[]) => [...rows].sort((a, b) => {
    const aProject = a.projectId;
    const bProject = b.projectId;

    if (!aProject && !bProject) {
        return a.id.localeCompare(b.id, 'ru');
    }

    if (!aProject) {
        return 1;
    }

    if (!bProject) {
        return -1;
    }

    return aProject.localeCompare(bProject, 'ru');
});

export function useGlobalPurchasesTable(initialRows: PurchaseRow[], initialRange: PurchaseRowsRange) {
    const [rows, setRows] = useState<PurchaseRow[]>(() => sortRowsByProjectId(initialRows));
    const [range, setRange] = useState<PurchaseRowsRange>(initialRange);
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

    const reloadRows = useCallback(async (nextRange: PurchaseRowsRange) => {
        const loadedRows = await globalPurchasesActionRepo.list(nextRange);
        setRows(sortRowsByProjectId(loadedRows));
    }, []);

    const addManualRow = useCallback(async (projectId: string | null) => {
        const created = await globalPurchasesActionRepo.addManual(projectId, range.from);
        setRows((prev) => sortRowsByProjectId([...prev, created]));
        return created;
    }, [range.from]);

    const addCatalogRow = useCallback(async (material: CatalogMaterial, projectId: string | null) => {
        const created = await globalPurchasesActionRepo.addFromCatalog(material, projectId, range.from);
        setRows((prev) => sortRowsByProjectId([...prev, created]));
        return created;
    }, [range.from]);

    const updateRow = useCallback(async (rowId: string, patch: PurchaseRowPatch) => {
        if (pendingIds.has(rowId)) return;

        // Capture previous state for potential rollback
        const existing = rows.find((r) => r.id === rowId);
        if (!existing) return;
        const prevRow = existing;

        setPendingIds((prev) => new Set(prev).add(rowId));

        // Optimistic update
        setRows((current) => current.map((row) => (row.id === rowId ? patchPurchaseRow(row, patch) : row)));

        try {
            const updated = await globalPurchasesActionRepo.patch(rowId, patch);
            setRows((current) => sortRowsByProjectId(current.map((row) => (row.id === rowId ? updated : row))));
        } catch (serviceError) {
            // Rollback
            setRows((current) => current.map((row) => (row.id === rowId ? prevRow : row)));
            throw serviceError;
        } finally {
            setPendingIds((prev) => {
                const next = new Set(prev);
                next.delete(rowId);
                return next;
            });
        }
    }, [pendingIds, rows]);

    const removeRow = useCallback(async (rowId: string) => {
        if (pendingIds.has(rowId)) return;

        const existingIndex = rows.findIndex((r) => r.id === rowId);
        if (existingIndex < 0) return;
        const removedRow = rows[existingIndex];

        setPendingIds((prev) => new Set(prev).add(rowId));

        // Optimistic remove
        setRows((current) => current.filter((row) => row.id !== rowId));

        try {
            await globalPurchasesActionRepo.remove(rowId);
        } catch (serviceError) {
            // Rollback
            setRows((current) => {
                if (current.some((row) => row.id === rowId)) return current;
                const nextRows = [...current];
                nextRows.splice(existingIndex, 0, removedRow);
                return nextRows;
            });
            throw serviceError;
        } finally {
            setPendingIds((prev) => {
                const next = new Set(prev);
                next.delete(rowId);
                return next;
            });
        }
    }, [pendingIds, rows]);

    const copyToNextDay = useCallback(async () => {
        const createdRows = await globalPurchasesActionRepo.copyToNextDay(range.from);
        return createdRows;
    }, [range.from]);

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
        copyToNextDay,
        totals,
        addedMaterialNames,
        pendingIds,
    };
}
