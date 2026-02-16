import { beforeEach, describe, expect, it, vi } from 'vitest';

const actionMocks = vi.hoisted(() => ({
    addGlobalPurchaseAction: vi.fn(),
    patchGlobalPurchaseAction: vi.fn(),
    removeGlobalPurchaseAction: vi.fn(),
}));

vi.mock('@/app/actions/global-purchases', () => actionMocks);

import { globalPurchasesActionRepo } from '@/features/global-purchases/repository/global-purchases.actions';

describe('globalPurchasesActionRepo', () => {
    beforeEach(() => {
        actionMocks.addGlobalPurchaseAction.mockReset();
        actionMocks.patchGlobalPurchaseAction.mockReset();
        actionMocks.removeGlobalPurchaseAction.mockReset();
    });

    it('creates manual row through server action', async () => {
        actionMocks.addGlobalPurchaseAction.mockResolvedValue({
            success: true,
            data: {
                id: '1',
                projectName: 'ЖК Горизонт',
                materialName: '',
                unit: 'шт',
                qty: 1,
                price: 0,
                amount: 0,
                note: '',
                source: 'manual',
            },
        });

        const row = await globalPurchasesActionRepo.addManual('ЖК Горизонт');

        expect(actionMocks.addGlobalPurchaseAction).toHaveBeenCalled();
        expect(row.source).toBe('manual');
    });

    it('patches row via server action', async () => {
        actionMocks.patchGlobalPurchaseAction.mockResolvedValue({
            success: true,
            data: {
                id: '1',
                projectName: 'A',
                materialName: 'Цемент',
                unit: 'мешок',
                qty: 2,
                price: 500,
                amount: 1000,
                note: '',
                source: 'catalog',
            },
        });

        const row = await globalPurchasesActionRepo.patch('1', { qty: 2 });

        expect(actionMocks.patchGlobalPurchaseAction).toHaveBeenCalledWith('1', { qty: 2 });
        expect(row.amount).toBe(1000);
    });

    it('throws when remove action fails', async () => {
        actionMocks.removeGlobalPurchaseAction.mockResolvedValue({
            success: false,
            error: { message: 'Ошибка удаления' },
        });

        await expect(globalPurchasesActionRepo.remove('1')).rejects.toThrow('Ошибка удаления');
    });
});
