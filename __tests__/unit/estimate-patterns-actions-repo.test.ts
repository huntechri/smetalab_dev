import { beforeEach, describe, expect, it, vi } from 'vitest';

const actionsMocks = vi.hoisted(() => ({
  listEstimatePatternsAction: vi.fn(),
  createEstimatePatternAction: vi.fn(),
  previewEstimatePatternAction: vi.fn(),
  applyEstimatePatternAction: vi.fn(),
  removeEstimatePatternAction: vi.fn(),
}));

vi.mock('@/app/actions/estimates/patterns', () => ({
  listEstimatePatternsAction: actionsMocks.listEstimatePatternsAction,
  createEstimatePatternAction: actionsMocks.createEstimatePatternAction,
  previewEstimatePatternAction: actionsMocks.previewEstimatePatternAction,
  applyEstimatePatternAction: actionsMocks.applyEstimatePatternAction,
  removeEstimatePatternAction: actionsMocks.removeEstimatePatternAction,
}));

import { estimatePatternsActionRepo } from '@/features/projects/estimates/repository/patterns.actions';

describe('estimatePatternsActionRepo', () => {
  beforeEach(() => {
    actionsMocks.listEstimatePatternsAction.mockReset();
    actionsMocks.createEstimatePatternAction.mockReset();
    actionsMocks.previewEstimatePatternAction.mockReset();
    actionsMocks.applyEstimatePatternAction.mockReset();
    actionsMocks.removeEstimatePatternAction.mockReset();
  });

  it('loads patterns list', async () => {
    actionsMocks.listEstimatePatternsAction.mockResolvedValue({ success: true, data: [{ id: 'p-1', name: 'test', description: null, rowsCount: 2, worksCount: 1, materialsCount: 1, updatedAt: new Date() }] });

    const result = await estimatePatternsActionRepo.list();

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('p-1');
  });

  it('creates pattern', async () => {
    actionsMocks.createEstimatePatternAction.mockResolvedValue({ success: true, data: { id: 'p-2' } });

    const result = await estimatePatternsActionRepo.create({ estimateId: 'est-id', name: 'Черновой ремонт' });

    expect(result.id).toBe('p-2');
    expect(actionsMocks.createEstimatePatternAction).toHaveBeenCalledWith({ estimateId: 'est-id', name: 'Черновой ремонт' });
  });

  it('throws when action fails', async () => {
    actionsMocks.applyEstimatePatternAction.mockResolvedValue({ success: false, error: { message: 'Ошибка применения' } });

    await expect(estimatePatternsActionRepo.apply({ estimateId: 'e', patternId: 'p' })).rejects.toThrow('Ошибка применения');
  });
});

