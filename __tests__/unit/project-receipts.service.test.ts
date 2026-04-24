import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sql } from 'drizzle-orm';

const whereMock = vi.hoisted(() => vi.fn());
const fromMock = vi.hoisted(() => vi.fn(() => ({ where: whereMock })));
const selectMock = vi.hoisted(() => vi.fn(() => ({ from: fromMock })));

vi.mock('@/lib/data/db/drizzle', () => ({
  db: {
    select: selectMock,
  },
}));

vi.mock('@/lib/data/db/queries', () => ({
  withActiveTenant: vi.fn(() => sql`TRUE`),
}));

import { ProjectReceiptsService } from '@/lib/services/project-receipts.service';

describe('ProjectReceiptsService.getConfirmedTotalsByPeriods', () => {
  beforeEach(() => {
    selectMock.mockClear();
    fromMock.mockClear();
    whereMock.mockReset();
  });

  it('loads 1/3/12 month totals, cumulative total and corrections in one aggregate query', async () => {
    whereMock.mockResolvedValue([
      {
        month1Raw: '1500',
        month3Raw: '4200',
        month12Raw: '13100',
        cumulativeRaw: '15500',
        hasCorrectionsRaw: '2',
      },
    ]);

    const result = await ProjectReceiptsService.getConfirmedTotalsByPeriods(7, 'project-uuid', new Date('2026-04-24T00:00:00Z'));

    expect(selectMock).toHaveBeenCalledTimes(1);
    expect(fromMock).toHaveBeenCalledTimes(1);
    expect(whereMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      month1: 1500,
      month3: 4200,
      month12: 13100,
      cumulative: 15500,
      hasCorrections: true,
    });
  });

  it('returns zeros and false when aggregate row is missing', async () => {
    whereMock.mockResolvedValue([]);

    const result = await ProjectReceiptsService.getConfirmedTotalsByPeriods(7, 'project-uuid', new Date('2026-04-24T00:00:00Z'));

    expect(result).toEqual({
      month1: 0,
      month3: 0,
      month12: 0,
      cumulative: 0,
      hasCorrections: false,
    });
  });

  it('keeps hasCorrections false when corrections/refunds/adjustments are absent', async () => {
    whereMock.mockResolvedValue([
      {
        month1Raw: '200',
        month3Raw: '700',
        month12Raw: '2400',
        cumulativeRaw: '2400',
        hasCorrectionsRaw: '0',
      },
    ]);

    const result = await ProjectReceiptsService.getConfirmedTotalsByPeriods(7, 'project-uuid', new Date('2026-04-24T00:00:00Z'));

    expect(result.hasCorrections).toBe(false);
    expect(result.month1).toBe(200);
    expect(result.month3).toBe(700);
    expect(result.month12).toBe(2400);
    expect(result.cumulative).toBe(2400);
  });
});
