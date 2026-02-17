import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const repoMocks = vi.hoisted(() => ({
    list: vi.fn(),
    addManual: vi.fn(),
    addFromCatalog: vi.fn(),
    patch: vi.fn(),
    remove: vi.fn(),
}));

vi.mock('@/features/global-purchases/repository/global-purchases.actions', () => ({
    globalPurchasesActionRepo: repoMocks,
}));

import { useGlobalPurchasesTable } from '@/features/global-purchases/hooks/useGlobalPurchasesTable';
import type { PurchaseRow } from '@/features/global-purchases/types/dto';

const baseRows: PurchaseRow[] = [
    {
        id: '1',
        projectId: null,
        projectName: '',
        materialName: 'Цемент',
        unit: 'шт',
        qty: 1,
        price: 100,
        amount: 100,
        note: '',
        source: 'manual',
        purchaseDate: '2026-01-15',
                supplierId: null,
                supplierName: null,
                supplierColor: null,
    },
    {
        id: '2',
        projectId: null,
        projectName: '',
        materialName: 'Песок',
        unit: 'шт',
        qty: 1,
        price: 50,
        amount: 50,
        note: '',
        source: 'manual',
        purchaseDate: '2026-01-15',
                supplierId: null,
                supplierName: null,
                supplierColor: null,
    },
];

describe('useGlobalPurchasesTable', () => {
    beforeEach(() => {
        repoMocks.list.mockReset();
        repoMocks.addManual.mockReset();
        repoMocks.addFromCatalog.mockReset();
        repoMocks.patch.mockReset();
        repoMocks.remove.mockReset();
    });

    it('rolls back only failed row on patch error', async () => {
        repoMocks.patch.mockRejectedValueOnce(new Error('fail'));

        const { result } = renderHook(() => useGlobalPurchasesTable(baseRows, { from: '2026-01-15', to: '2026-01-15' }));

        await expect(async () => {
            await act(async () => {
                await result.current.updateRow('1', { qty: 4 });
            });
        }).rejects.toThrow('fail');

        expect(result.current.rows.find((row) => row.id === '1')?.qty).toBe(1);
        expect(result.current.rows.find((row) => row.id === '2')?.qty).toBe(1);
    });

    it('restores removed row at original position on remove error', async () => {
        repoMocks.remove.mockRejectedValueOnce(new Error('delete-failed'));

        const { result } = renderHook(() => useGlobalPurchasesTable(baseRows, { from: '2026-01-15', to: '2026-01-15' }));

        await expect(async () => {
            await act(async () => {
                await result.current.removeRow('1');
            });
        }).rejects.toThrow('delete-failed');

        expect(result.current.rows.map((row) => row.id)).toEqual(['1', '2']);
    });

    it('appends added rows to the end when project ids are equal', async () => {
        repoMocks.addManual.mockResolvedValueOnce({
            id: '3',
            projectId: null,
            projectName: '',
            materialName: 'Щебень',
            unit: 'шт',
            qty: 1,
            price: 200,
            amount: 200,
            note: '',
            source: 'manual',
            purchaseDate: '2026-01-15',
                supplierId: null,
                supplierName: null,
                supplierColor: null,
        });

        const { result } = renderHook(() => useGlobalPurchasesTable(baseRows, { from: '2026-01-15', to: '2026-01-15' }));

        await act(async () => {
            await result.current.addManualRow(null);
        });

        expect(result.current.rows.map((row) => row.id)).toEqual(['1', '2', '3']);
    });

    it('keeps rows sorted by project id by default', async () => {
        const unsortedRows: PurchaseRow[] = [
            {
                id: '1',
                projectId: null,
                projectName: '',
                materialName: 'Цемент',
                unit: 'шт',
                qty: 1,
                price: 100,
                amount: 100,
                note: '',
                source: 'manual',
                purchaseDate: '2026-01-15',
                supplierId: null,
                supplierName: null,
                supplierColor: null,
            },
            {
                id: '2',
                projectId: 'project-2',
                projectName: 'B',
                materialName: 'Песок',
                unit: 'шт',
                qty: 1,
                price: 50,
                amount: 50,
                note: '',
                source: 'manual',
                purchaseDate: '2026-01-15',
                supplierId: null,
                supplierName: null,
                supplierColor: null,
            },
            {
                id: '3',
                projectId: 'project-1',
                projectName: 'A',
                materialName: 'Щебень',
                unit: 'шт',
                qty: 1,
                price: 150,
                amount: 150,
                note: '',
                source: 'manual',
                purchaseDate: '2026-01-15',
                supplierId: null,
                supplierName: null,
                supplierColor: null,
            },
        ];

        const { result } = renderHook(() => useGlobalPurchasesTable(unsortedRows, { from: '2026-01-15', to: '2026-01-15' }));

        expect(result.current.rows.map((row) => row.projectId)).toEqual(['project-1', 'project-2', null]);
    });
});
