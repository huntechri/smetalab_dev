import { beforeEach, describe, expect, it, vi } from 'vitest';

const actionsMocks = vi.hoisted(() => ({
    patchEstimateRowAction: vi.fn(),
    addEstimateWorkAction: vi.fn(),
    addEstimateMaterialAction: vi.fn(),
    removeEstimateRowAction: vi.fn(),
}));

vi.mock('@/app/actions/estimates/rows', () => ({
    patchEstimateRowAction: actionsMocks.patchEstimateRowAction,
    addEstimateWorkAction: actionsMocks.addEstimateWorkAction,
    addEstimateMaterialAction: actionsMocks.addEstimateMaterialAction,
    removeEstimateRowAction: actionsMocks.removeEstimateRowAction,
}));

import { estimatesActionRepo } from '@/features/projects/estimates/repository/estimates.actions';

describe('estimatesActionRepo', () => {
    beforeEach(() => {
        actionsMocks.patchEstimateRowAction.mockReset();
        actionsMocks.addEstimateWorkAction.mockReset();
        actionsMocks.addEstimateMaterialAction.mockReset();
        actionsMocks.removeEstimateRowAction.mockReset();
    });

    it('calls addEstimateWorkAction and returns created row', async () => {
        actionsMocks.addEstimateWorkAction.mockResolvedValue({
            success: true,
            data: {
                id: 'w-1',
                kind: 'work',
                code: '1',
                name: 'Работа',
                unit: 'м2',
                qty: 1,
                price: 200,
                sum: 200,
                expense: 0,
                order: 100,
            },
        });

        const row = await estimatesActionRepo.addWork('est-1', { name: 'Работа' });

        expect(actionsMocks.addEstimateWorkAction).toHaveBeenCalledWith('est-1', {
            name: 'Работа',
            unit: undefined,
            qty: undefined,
            price: undefined,
            expense: undefined,
            insertAfterWorkId: undefined,
        });
        expect(row.id).toBe('w-1');
    });


    it('passes insertAfterWorkId when adding work below selected row', async () => {
        actionsMocks.addEstimateWorkAction.mockResolvedValue({
            success: true,
            data: {
                id: 'w-2',
                kind: 'work',
                code: '2',
                name: 'Новая работа',
                unit: 'шт',
                qty: 1,
                price: 0,
                sum: 0,
                expense: 0,
                order: 200,
            },
        });

        await estimatesActionRepo.addWork('est-1', { insertAfterWorkId: 'w-1' });

        expect(actionsMocks.addEstimateWorkAction).toHaveBeenCalledWith('est-1', {
            name: 'Новая работа',
            unit: undefined,
            qty: undefined,
            price: undefined,
            expense: undefined,
            insertAfterWorkId: 'w-1',
        });
    });

    it('passes imageUrl when adding a material', async () => {
        actionsMocks.addEstimateMaterialAction.mockResolvedValue({
            success: true,
            data: {
                id: 'm-1',
                kind: 'material',
                parentWorkId: 'w-1',
                code: '1.1',
                name: 'Материал',
                imageUrl: 'https://example.com/image.png',
                unit: 'шт',
                qty: 1,
                price: 200,
                sum: 200,
                expense: 0,
                order: 101,
            },
        });

        await estimatesActionRepo.addMaterial('est-1', 'w-1', {
            name: 'Материал',
            imageUrl: 'https://example.com/image.png',
        });

        expect(actionsMocks.addEstimateMaterialAction).toHaveBeenCalledWith('est-1', 'w-1', {
            name: 'Материал',
            imageUrl: 'https://example.com/image.png',
        });
    });

    it('removes estimate row', async () => {
        actionsMocks.removeEstimateRowAction.mockResolvedValue({
            success: true,
            data: { removedIds: ['w-1', 'm-1'] },
        });

        const result = await estimatesActionRepo.removeRow('est-1', 'w-1');

        expect(actionsMocks.removeEstimateRowAction).toHaveBeenCalledWith('est-1', 'w-1');
        expect(result.removedIds).toEqual(['w-1', 'm-1']);
    });

    it('throws when action returns error', async () => {
        actionsMocks.patchEstimateRowAction.mockResolvedValue({
            success: false,
            error: { message: 'Ошибка' },
        });

        await expect(estimatesActionRepo.patchRow('est-1', 'w-1', { qty: 2 })).rejects.toThrow('Ошибка');
    });
});
