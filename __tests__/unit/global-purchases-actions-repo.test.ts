import { beforeEach, describe, expect, it, vi } from 'vitest';

const actionMocks = vi.hoisted(() => ({
    getGlobalPurchasesAction: vi.fn(),
    addGlobalPurchaseAction: vi.fn(),
    patchGlobalPurchaseAction: vi.fn(),
    removeGlobalPurchaseAction: vi.fn(),
    patchGlobalPurchasesBatchAction: vi.fn(),
    importGlobalPurchasesAction: vi.fn(),
}));

vi.mock('@/app/actions/global-purchases', () => actionMocks);

import { globalPurchasesActionRepo } from '@/features/global-purchases/repository/global-purchases.actions';

describe('globalPurchasesActionRepo', () => {
    beforeEach(() => {
        actionMocks.addGlobalPurchaseAction.mockReset();
        actionMocks.getGlobalPurchasesAction.mockReset();
        actionMocks.patchGlobalPurchaseAction.mockReset();
        actionMocks.removeGlobalPurchaseAction.mockReset();
        actionMocks.patchGlobalPurchasesBatchAction.mockReset();
        actionMocks.importGlobalPurchasesAction.mockReset();
    });

    it('loads rows by date range', async () => {
        actionMocks.getGlobalPurchasesAction.mockResolvedValue({
            success: true,
            data: [],
        });

        await globalPurchasesActionRepo.list({ from: '2026-01-15', to: '2026-01-15' });

        expect(actionMocks.getGlobalPurchasesAction).toHaveBeenCalledWith({ from: '2026-01-15', to: '2026-01-15' });
    });

    it('creates manual row through server action', async () => {
        actionMocks.addGlobalPurchaseAction.mockResolvedValue({
            success: true,
            data: {
                id: '1',
                projectId: 'project-1',
                projectName: 'ЖК Горизонт',
                materialName: '',
                unit: 'шт',
                qty: 1,
                price: 0,
                amount: 0,
                note: '',
                source: 'manual',
                purchaseDate: '2026-01-15',
                supplierId: null,
                supplierName: null,
                supplierColor: null,
            },
        });

        const row = await globalPurchasesActionRepo.addManual('project-1', '2026-01-15');

        expect(actionMocks.addGlobalPurchaseAction).toHaveBeenCalled();
        expect(row.source).toBe('manual');
    });

    it('patches row via server action', async () => {
        actionMocks.patchGlobalPurchaseAction.mockResolvedValue({
            success: true,
            data: {
                id: '1',
                projectId: null,
                projectName: 'A',
                materialName: 'Цемент',
                unit: 'мешок',
                qty: 2,
                price: 500,
                amount: 1000,
                note: '',
                source: 'catalog',
                purchaseDate: '2026-01-15',
                supplierId: null,
                supplierName: null,
                supplierColor: null,
            },
        });

        const row = await globalPurchasesActionRepo.patch('1', { qty: 2 });

        expect(actionMocks.patchGlobalPurchaseAction).toHaveBeenCalledWith('1', { qty: 2 });
        expect(row.amount).toBe(1000);
    });



    it('patches multiple rows via batch server action', async () => {
        actionMocks.patchGlobalPurchasesBatchAction.mockResolvedValue({
            success: true,
            data: [{
                id: '1',
                projectId: null,
                projectName: 'A',
                materialName: 'Цемент',
                unit: 'мешок',
                qty: 2,
                price: 500,
                amount: 1000,
                note: '',
                source: 'catalog',
                purchaseDate: '2026-01-15',
                supplierId: null,
                supplierName: null,
                supplierColor: null,
            }],
        });

        const rows = await globalPurchasesActionRepo.patchBatch({ updates: [{ rowId: '1', patch: { qty: 2 } }] });

        expect(actionMocks.patchGlobalPurchasesBatchAction).toHaveBeenCalledWith({ updates: [{ rowId: '1', patch: { qty: 2 } }] });
        expect(rows).toHaveLength(1);
    });

    it('throws when remove action fails', async () => {
        actionMocks.removeGlobalPurchaseAction.mockResolvedValue({
            success: false,
            error: { message: 'Ошибка удаления' },
        });

        await expect(globalPurchasesActionRepo.remove('1')).rejects.toThrow('Ошибка удаления');
    });

    it('imports rows via server action', async () => {
        actionMocks.importGlobalPurchasesAction.mockResolvedValue({
            success: true,
            data: [{
                id: 'new-row',
                projectId: null,
                projectName: 'Объект A',
                materialName: 'Арматура',
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
            }],
        });

        const rows = await globalPurchasesActionRepo.importRows([{
            purchaseDate: '2026-01-15',
            projectName: 'Объект A',
            materialName: 'Арматура',
            unit: 'шт',
            qty: 1,
            price: 100,
            note: '',
            supplierName: '',
        }]);

        expect(actionMocks.importGlobalPurchasesAction).toHaveBeenCalled();
        expect(rows).toHaveLength(1);
    });
});
