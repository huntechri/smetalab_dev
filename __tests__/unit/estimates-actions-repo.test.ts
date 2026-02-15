import { beforeEach, describe, expect, it, vi } from 'vitest';

const actionsMocks = vi.hoisted(() => ({
    patchEstimateRowAction: vi.fn(),
    addEstimateWorkAction: vi.fn(),
    addEstimateMaterialAction: vi.fn(),
}));

vi.mock('@/app/actions/estimates/rows', () => ({
    patchEstimateRowAction: actionsMocks.patchEstimateRowAction,
    addEstimateWorkAction: actionsMocks.addEstimateWorkAction,
    addEstimateMaterialAction: actionsMocks.addEstimateMaterialAction,
}));

import { estimatesActionRepo } from '@/features/projects/estimates/repository/estimates.actions';

describe('estimatesActionRepo', () => {
    beforeEach(() => {
        actionsMocks.patchEstimateRowAction.mockReset();
        actionsMocks.addEstimateWorkAction.mockReset();
        actionsMocks.addEstimateMaterialAction.mockReset();
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
        });
        expect(row.id).toBe('w-1');
    });

    it('throws when action returns error', async () => {
        actionsMocks.patchEstimateRowAction.mockResolvedValue({
            success: false,
            error: { message: 'Ошибка' },
        });

        await expect(estimatesActionRepo.patchRow('est-1', 'w-1', { qty: 2 })).rejects.toThrow('Ошибка');
    });
});
