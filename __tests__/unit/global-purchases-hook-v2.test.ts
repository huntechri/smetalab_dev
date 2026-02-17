import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useGlobalPurchasesTable } from '@/features/global-purchases/hooks/useGlobalPurchasesTable';
import { globalPurchasesActionRepo } from '@/features/global-purchases/repository/global-purchases.actions';
import type { PurchaseRow } from '@/features/global-purchases/types/dto';

vi.mock('@/features/global-purchases/repository/global-purchases.actions', () => ({
    globalPurchasesActionRepo: {
        patch: vi.fn(),
        remove: vi.fn(),
        list: vi.fn(),
        copyToNextDay: vi.fn(),
    },
}));

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

const mockRow: PurchaseRow = {
    id: 'row-1',
    projectId: VALID_UUID,
    projectName: 'Project 1',
    materialName: 'Sand',
    unit: 'm3',
    qty: 10,
    price: 100,
    amount: 1000,
    note: '',
    source: 'manual',
    purchaseDate: '2023-10-27',
        supplierId: null,
        supplierName: null,
        supplierColor: null,
};

describe('useGlobalPurchasesTable Concurrency', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('prevents concurrent updates on the same row', async () => {
        const { result } = renderHook(() => useGlobalPurchasesTable([mockRow], { from: '2023-10-27', to: '2023-10-27' }));

        let resolvePatch: (value: PurchaseRow) => void = () => {};
        const patchPromise = new Promise<PurchaseRow>((resolve) => {
            resolvePatch = resolve;
        });
        vi.mocked(globalPurchasesActionRepo.patch).mockReturnValue(patchPromise);

        // Start update
        let actPromise: Promise<void>;
        await act(async () => {
            actPromise = result.current.updateRow('row-1', { qty: 20 });
        });

        // Verify optimistic update and pending status
        await waitFor(() => {
            expect(result.current.pendingIds.has('row-1')).toBe(true);
            expect(result.current.rows[0].qty).toBe(20);
        });

        // Try second update
        await act(async () => {
            await result.current.updateRow('row-1', { qty: 30 });
        });

        // Verify second update was ignored
        expect(result.current.rows[0].qty).toBe(20);
        expect(globalPurchasesActionRepo.patch).toHaveBeenCalledTimes(1);

        // Resolve first update
        await act(async () => {
            resolvePatch({ ...mockRow, qty: 20, amount: 2000 });
        });

        await act(async () => {
            await actPromise!;
        });

        // Verify completion
        await waitFor(() => {
            expect(result.current.pendingIds.has('row-1')).toBe(false);
            expect(result.current.rows[0].qty).toBe(20);
        });
    });

    it('blocks duplicate update calls fired in the same tick', async () => {
        const { result } = renderHook(() => useGlobalPurchasesTable([mockRow], { from: '2023-10-27', to: '2023-10-27' }));

        let resolvePatch: (value: PurchaseRow) => void = () => {};
        const patchPromise = new Promise<PurchaseRow>((resolve) => {
            resolvePatch = resolve;
        });
        vi.mocked(globalPurchasesActionRepo.patch).mockReturnValue(patchPromise);

        await act(async () => {
            const firstCall = result.current.updateRow('row-1', { qty: 20 });
            const secondCall = result.current.updateRow('row-1', { qty: 30 });
            await secondCall;

            resolvePatch({ ...mockRow, qty: 20, amount: 2000 });
            await firstCall;
        });

        expect(globalPurchasesActionRepo.patch).toHaveBeenCalledTimes(1);
        expect(result.current.rows[0].qty).toBe(20);
    });

    it('rolls back specific row on failure without affecting others', async () => {
        const row2 = { ...mockRow, id: 'row-2', materialName: 'Stone' };
        const { result } = renderHook(() => useGlobalPurchasesTable([mockRow, row2], { from: '2023-10-27', to: '2023-10-27' }));

        vi.mocked(globalPurchasesActionRepo.patch).mockRejectedValue(new Error('Network error'));

        await act(async () => {
            try {
                await result.current.updateRow('row-1', { qty: 50 });
            } catch {
                // Expected
            }
        });

        await waitFor(() => {
            expect(result.current.rows.find(r => r.id === 'row-1')?.qty).toBe(10); // Rolled back
            expect(result.current.rows.find(r => r.id === 'row-2')?.materialName).toBe('Stone'); // Unaffected
        });
    });
});
