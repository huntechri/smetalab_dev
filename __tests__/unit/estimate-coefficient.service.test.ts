import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMock = vi.hoisted(() => {
    const returning = vi.fn();
    const where = vi.fn(() => ({ returning }));
    const set = vi.fn(() => ({ where }));
    const update = vi.fn(() => ({ set }));

    return { update, set, where, returning };
});

vi.mock('@/lib/data/db/drizzle', () => ({
    db: {
        update: dbMock.update,
    },
}));

import { EstimateCoefficientService } from '@/lib/services/estimate-coefficient.service';

describe('EstimateCoefficientService', () => {
    beforeEach(() => {
        dbMock.update.mockClear();
        dbMock.set.mockClear();
        dbMock.where.mockClear();
        dbMock.returning.mockReset();
    });

    it('updates coefficient when estimate exists', async () => {
        dbMock.returning.mockResolvedValue([{ coefPercent: 25 }]);
        const result = await EstimateCoefficientService.update(1, 'est-1', { coefPercent: 25 });

        expect(result.success).toBe(true);
        expect(dbMock.set).toHaveBeenCalledTimes(1);
        const [payload] = dbMock.set.mock.calls[0] as Array<[Record<string, unknown>]>;
        expect(payload).toHaveProperty('executionSyncVersion');
        if (result.success) {
            expect(result.data.coefPercent).toBe(25);
        }
    });

    it('returns validation error for out-of-range coefficient', async () => {
        const result = await EstimateCoefficientService.update(1, 'est-1', { coefPercent: 9999 });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.code).toBe('VALIDATION_ERROR');
        }
    });
});
