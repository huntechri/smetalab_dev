import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const repoMocks = vi.hoisted(() => ({
    list: vi.fn(),
    addManual: vi.fn(),
    addFromCatalog: vi.fn(),
    patch: vi.fn(),
    patchBatch: vi.fn(),
    remove: vi.fn(),
    copyToNextDay: vi.fn(),
}));

vi.mock('@/features/global-purchases/repository/global-purchases.actions', () => ({
    globalPurchasesActionRepo: repoMocks,
}));

import { useGlobalPurchasesTable } from '@/features/global-purchases/hooks/useGlobalPurchasesTable';
import type { PurchaseRow } from '@/features/global-purchases/types/dto';

const baseRows: PurchaseRow[] = [
    { id: '1', projectId: null, projectName: '', materialName: 'Цемент', unit: 'шт', qty: 1, price: 100, amount: 100, note: '', source: 'manual', purchaseDate: '2026-01-15', supplierId: null, supplierName: null, supplierColor: null },
    { id: '2', projectId: null, projectName: '', materialName: 'Песок', unit: 'шт', qty: 1, price: 50, amount: 50, note: '', source: 'manual', purchaseDate: '2026-01-15', supplierId: null, supplierName: null, supplierColor: null },
];

describe('useGlobalPurchasesTable', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        repoMocks.list.mockReset();
        repoMocks.addManual.mockReset();
        repoMocks.addFromCatalog.mockReset();
        repoMocks.patch.mockReset();
        repoMocks.patchBatch.mockReset();
        repoMocks.remove.mockReset();
        repoMocks.copyToNextDay.mockReset();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('debounces sequential patches into a single batch request', async () => {
        repoMocks.patchBatch.mockResolvedValue([{ ...baseRows[0], qty: 3, price: 120, amount: 360 }]);
        const { result } = renderHook(() => useGlobalPurchasesTable(baseRows, { from: '2026-01-15', to: '2026-01-15' }));

        let first!: Promise<void>;
        let second!: Promise<void>;
        await act(async () => {
            first = result.current.updateRow('1', { qty: 3 });
            second = result.current.updateRow('1', { price: 120 });
            await vi.advanceTimersByTimeAsync(180);
        });
        await Promise.all([first, second]);

        expect(repoMocks.patchBatch).toHaveBeenCalledTimes(1);
        expect(repoMocks.patchBatch).toHaveBeenCalledWith({ updates: [{ rowId: '1', patch: { qty: 3, price: 120 } }] });
    });

    it('restores removed row at original position on remove error', async () => {
        repoMocks.remove.mockRejectedValueOnce(new Error('delete-failed'));
        const { result } = renderHook(() => useGlobalPurchasesTable(baseRows, { from: '2026-01-15', to: '2026-01-15' }));

        await expect(result.current.removeRow('1')).rejects.toThrow('delete-failed');
        expect(result.current.rows.map((row) => row.id)).toEqual(['1', '2']);
    });

    it('appends added rows to the end when project ids are equal', async () => {
        repoMocks.addManual.mockResolvedValueOnce({ id: '3', projectId: null, projectName: '', materialName: 'Щебень', unit: 'шт', qty: 1, price: 200, amount: 200, note: '', source: 'manual', purchaseDate: '2026-01-15', supplierId: null, supplierName: null, supplierColor: null });
        const { result } = renderHook(() => useGlobalPurchasesTable(baseRows, { from: '2026-01-15', to: '2026-01-15' }));

        await act(async () => {
            await result.current.addManualRow(null);
        });

        expect(result.current.rows.map((row) => row.id)).toEqual(['1', '2', '3']);
    });
});
