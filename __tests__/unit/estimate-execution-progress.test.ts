import { describe, expect, it } from 'vitest';
import { calculateEstimateExecutionProgress } from '@/features/projects/estimates/lib/execution-progress';

describe('calculateEstimateExecutionProgress', () => {
  it('returns 0 percent when there are no estimate works', () => {
    const result = calculateEstimateExecutionProgress([
      {
        id: 'a9f2ce8b-a727-4f4b-84f3-b81994221866',
        estimateRowId: null,
        source: 'extra',
        status: 'done',
        code: 'Доп-1',
        name: 'Доп работа',
        unit: 'шт',
        plannedQty: 0,
        plannedPrice: 0,
        plannedSum: 0,
        actualQty: 1,
        actualPrice: 1,
        actualSum: 1,
        isCompleted: true,
        order: 1,
      },
    ]);

    expect(result).toEqual({ totalWorks: 0, completedWorks: 0, percent: 0 });
  });

  it('calculates progress only for from_estimate rows', () => {
    const result = calculateEstimateExecutionProgress([
      {
        id: '18cc6c2c-3f77-4439-ab90-8aa6b50ff1b7',
        estimateRowId: '18cc6c2c-3f77-4439-ab90-8aa6b50ff1b8',
        source: 'from_estimate',
        status: 'done',
        code: '1',
        name: 'Работа 1',
        unit: 'м2',
        plannedQty: 1,
        plannedPrice: 1,
        plannedSum: 1,
        actualQty: 1,
        actualPrice: 1,
        actualSum: 1,
        isCompleted: true,
        order: 1,
      },
      {
        id: '18cc6c2c-3f77-4439-ab90-8aa6b50ff1b9',
        estimateRowId: '18cc6c2c-3f77-4439-ab90-8aa6b50ff1ba',
        source: 'from_estimate',
        status: 'in_progress',
        code: '2',
        name: 'Работа 2',
        unit: 'м2',
        plannedQty: 1,
        plannedPrice: 1,
        plannedSum: 1,
        actualQty: 1,
        actualPrice: 1,
        actualSum: 1,
        isCompleted: false,
        order: 2,
      },
      {
        id: '18cc6c2c-3f77-4439-ab90-8aa6b50ff1bb',
        estimateRowId: null,
        source: 'extra',
        status: 'done',
        code: 'Доп',
        name: 'Доп работа',
        unit: 'м2',
        plannedQty: 0,
        plannedPrice: 0,
        plannedSum: 0,
        actualQty: 1,
        actualPrice: 1,
        actualSum: 1,
        isCompleted: true,
        order: 3,
      },
    ]);

    expect(result).toEqual({ totalWorks: 2, completedWorks: 1, percent: 50 });
  });
});
