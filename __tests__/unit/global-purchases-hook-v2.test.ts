import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useGlobalPurchasesTable } from '@/features/global-purchases/hooks/useGlobalPurchasesTable';
import { globalPurchasesActionRepo } from '@/features/global-purchases/repository/global-purchases.actions';
import type { PurchaseRow } from '@/features/global-purchases/types/dto';

vi.mock('@/features/global-purchases/repository/global-purchases.actions', () => ({
    globalPurchasesActionRepo: {
        patchBatch: vi.fn(),
        remove: vi.fn(),
        list: vi.fn(),
        copyToNextDay: vi.fn(),
    },
}));

const mockRow: PurchaseRow = {
    id: 'row-1',
    projectId: '550e8400-e29b-41d4-a716-446655440000',
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
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('merges duplicate update calls for the same row into one batch update', async () => {
        vi.mocked(globalPurchasesActionRepo.patchBatch).mockResolvedValue([{ ...mockRow, qty: 20, amount: 2000 }]);
        const { result } = renderHook(() => useGlobalPurchasesTable([mockRow], { from: '2023-10-27', to: '2023-10-27' }));

        let first!: Promise<void>;
        let second!: Promise<void>;
        await act(async () => {
            first = result.current.updateRow('row-1', { qty: 20 });
            second = result.current.updateRow('row-1', { qty: 30 });
            await vi.advanceTimersByTimeAsync(180);
        });
        await Promise.all([first, second]);

        expect(globalPurchasesActionRepo.patchBatch).toHaveBeenCalledTimes(1);
        expect(result.current.pendingIds.has('row-1')).toBe(false);
    });
});
