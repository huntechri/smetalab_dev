'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CatalogMaterial } from '@/features/catalog/types/dto';
import { notifyEstimatePurchasesMutated } from '@/features/projects/estimates/lib/estimate-client-events';
import { patchPurchaseRow } from '../lib/rows';
import { globalPurchasesActionRepo } from '../repository/global-purchases.actions';
import type { PurchaseRow, PurchaseRowPatch, PurchaseRowsRange } from '../types/dto';
import type { ImportablePurchaseRow } from '../lib/import-export';

const PATCH_DEBOUNCE_MS = 180;

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

const buildRowsSignature = (rows: PurchaseRow[]) => rows.map((row) => [
    row.id,
    row.projectId ?? '',
    row.projectName ?? '',
    row.purchaseDate,
    row.materialName,
    row.unit,
    row.qty,
    row.price,
    row.amount,
    row.note ?? '',
    row.supplierId ?? '',
    row.supplierName ?? '',
    row.supplierColor ?? '',
].join('\u001f')).join('\u001e');

export function useGlobalPurchasesTable(initialRows: PurchaseRow[], initialRange: PurchaseRowsRange) {
    const initialRowsSignatureRef = useRef<string | null>(null);
    const normalizedInitialRowsRef = useRef<PurchaseRow[]>([]);
    const nextInitialRowsSignature = buildRowsSignature(initialRows);

    if (initialRowsSignatureRef.current !== nextInitialRowsSignature) {
        initialRowsSignatureRef.current = nextInitialRowsSignature;
        normalizedInitialRowsRef.current = sortRowsByProjectId(initialRows);
    }

    const [rows, setRows] = useState<PurchaseRow[]>(() => normalizedInitialRowsRef.current);
    const [range, setRange] = useState<PurchaseRowsRange>(initialRange);
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
    const pendingIdsRef = useRef<Set<string>>(new Set());

    const queuedPatchesRef = useRef<Map<string, PurchaseRowPatch>>(new Map());
    const previousRowsRef = useRef<Map<string, PurchaseRow>>(new Map());
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const flushInFlightRef = useRef(false);
    const updateWaitersRef = useRef<Map<string, Array<{ resolve: () => void; reject: (error: unknown) => void }>>>(new Map());

    useEffect(() => {
        if (pendingIdsRef.current.size > 0 || queuedPatchesRef.current.size > 0 || flushInFlightRef.current) {
            return;
        }

        setRows(normalizedInitialRowsRef.current);
    }, [nextInitialRowsSignature]);

    const startPending = useCallback((rowId: string) => {
        if (pendingIdsRef.current.has(rowId)) {
            return;
        }

        const next = new Set(pendingIdsRef.current);
        next.add(rowId);
        pendingIdsRef.current = next;
        setPendingIds(next);
    }, []);

    const finishPendingMany = useCallback((rowIds: string[]) => {
        if (rowIds.length === 0) return;

        const next = new Set(pendingIdsRef.current);
        for (const rowId of rowIds) {
            next.delete(rowId);
        }

        pendingIdsRef.current = next;
        setPendingIds(next);
    }, []);

    const reloadRows = useCallback(async (nextRange: PurchaseRowsRange) => {
        const loadedRows = await globalPurchasesActionRepo.list(nextRange);
        setRows(sortRowsByProjectId(loadedRows));
    }, []);

    const addManualRow = useCallback(async (projectId: string | null) => {
        const created = await globalPurchasesActionRepo.addManual(projectId, range.from);
        setRows((prev) => sortRowsByProjectId([...prev, created]));
        notifyEstimatePurchasesMutated();
        return created;
    }, [range.from]);

    const addCatalogRow = useCallback(async (material: CatalogMaterial, projectId: string | null) => {
        const created = await globalPurchasesActionRepo.addFromCatalog(material, projectId, range.from);
        setRows((prev) => sortRowsByProjectId([...prev, created]));
        notifyEstimatePurchasesMutated();
        return created;
    }, [range.from]);

    const flushQueuedPatches = useCallback(async () => {
        if (flushInFlightRef.current || queuedPatchesRef.current.size === 0) {
            return;
        }

        flushInFlightRef.current = true;
        const batchEntries = [...queuedPatchesRef.current.entries()].map(([rowId, patch]) => ({ rowId, patch }));
        queuedPatchesRef.current.clear();

        try {
            const updatedRows = await globalPurchasesActionRepo.patchBatch({ updates: batchEntries });
            const updatedMap = new Map(updatedRows.map((row) => [row.id, row]));

            setRows((current) => sortRowsByProjectId(current.map((row) => updatedMap.get(row.id) ?? row)));
            notifyEstimatePurchasesMutated();
            for (const { rowId } of batchEntries) {
                previousRowsRef.current.delete(rowId);
                const waiters = updateWaitersRef.current.get(rowId) ?? [];
                waiters.forEach((waiter) => waiter.resolve());
                updateWaitersRef.current.delete(rowId);
            }
        } catch (serviceError) {
            const rollbackIds = batchEntries.map((entry) => entry.rowId);
            setRows((current) => current.map((row) => {
                const prevRow = previousRowsRef.current.get(row.id);
                return prevRow ?? row;
            }));

            for (const rowId of rollbackIds) {
                previousRowsRef.current.delete(rowId);
                const waiters = updateWaitersRef.current.get(rowId) ?? [];
                waiters.forEach((waiter) => waiter.reject(serviceError));
                updateWaitersRef.current.delete(rowId);
            }
        } finally {
            finishPendingMany(batchEntries.map((entry) => entry.rowId));
            flushInFlightRef.current = false;

            if (queuedPatchesRef.current.size > 0) {
                void flushQueuedPatches();
            }
        }
    }, [finishPendingMany]);

    const scheduleFlush = useCallback(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            debounceTimerRef.current = null;
            void flushQueuedPatches();
        }, PATCH_DEBOUNCE_MS);
    }, [flushQueuedPatches]);

    const updateRow = useCallback((rowId: string, patch: PurchaseRowPatch) => {
        const existing = rows.find((r) => r.id === rowId);
        if (!existing) {
            return Promise.resolve();
        }

        if (!previousRowsRef.current.has(rowId)) {
            previousRowsRef.current.set(rowId, existing);
        }

        const mergedPatch = {
            ...(queuedPatchesRef.current.get(rowId) ?? {}),
            ...patch,
        };

        queuedPatchesRef.current.set(rowId, mergedPatch);
        startPending(rowId);

        const waiterPromise = new Promise<void>((resolve, reject) => {
            const waiters = updateWaitersRef.current.get(rowId) ?? [];
            waiters.push({ resolve, reject });
            updateWaitersRef.current.set(rowId, waiters);
        });

        setRows((current) => current.map((row) => (row.id === rowId ? patchPurchaseRow(row, patch) : row)));
        scheduleFlush();

        return waiterPromise;
    }, [rows, scheduleFlush, startPending]);

    const removeRow = useCallback(async (rowId: string) => {
        startPending(rowId);

        const existingIndex = rows.findIndex((r) => r.id === rowId);
        if (existingIndex < 0) {
            finishPendingMany([rowId]);
            return;
        }
        const removedRow = rows[existingIndex];

        queuedPatchesRef.current.delete(rowId);
        previousRowsRef.current.delete(rowId);
        const waiters = updateWaitersRef.current.get(rowId) ?? [];
        waiters.forEach((waiter) => waiter.reject(new Error('ROW_REMOVED')));
        updateWaitersRef.current.delete(rowId);

        setRows((current) => current.filter((row) => row.id !== rowId));

        try {
            await globalPurchasesActionRepo.remove(rowId);
            notifyEstimatePurchasesMutated();
        } catch (serviceError) {
            setRows((current) => {
                if (current.some((row) => row.id === rowId)) return current;
                const nextRows = [...current];
                nextRows.splice(existingIndex, 0, removedRow);
                return nextRows;
            });
            throw serviceError;
        } finally {
            finishPendingMany([rowId]);
        }
    }, [finishPendingMany, rows, startPending]);

    const importRows = useCallback(async (payloadRows: ImportablePurchaseRow[]) => {
        const createdRows = await globalPurchasesActionRepo.importRows(payloadRows);
        setRows((prev) => sortRowsByProjectId([...prev, ...createdRows]));
        notifyEstimatePurchasesMutated();
        return createdRows;
    }, []);

    const copyToNextDay = useCallback(async () => {
        const createdRows = await globalPurchasesActionRepo.copyToNextDay(range.from);
        if (createdRows.length > 0) {
            notifyEstimatePurchasesMutated();
        }
        return createdRows;
    }, [range.from]);

    const totals = useMemo(() => rows.reduce((acc, row) => {
        acc.amount += row.amount;
        return acc;
    }, { amount: 0 }), [rows]);

    const addedMaterialNames = useMemo(() => new Set(rows.map((row) => row.materialName).filter(Boolean)), [rows]);

    useEffect(() => () => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
    }, []);

    return {
        rows,
        range,
        setRange,
        reloadRows,
        addManualRow,
        addCatalogRow,
        updateRow,
        removeRow,
        importRows,
        copyToNextDay,
        totals,
        addedMaterialNames,
        pendingIds,
    };
}
