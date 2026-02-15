import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMock = vi.hoisted(() => ({
    query: {
        estimates: {
            findFirst: vi.fn(),
        },
    },
    transaction: vi.fn(),
}));

vi.mock('@/lib/data/db/drizzle', () => ({
    db: dbMock,
}));

import { EstimateRowsService } from '@/lib/services/estimate-rows.service';

describe('EstimateRowsService duplicate protection', () => {
    beforeEach(() => {
        dbMock.query.estimates.findFirst.mockReset();
        dbMock.transaction.mockReset();
        dbMock.query.estimates.findFirst.mockResolvedValue({ id: 'est-1' });
    });

    it('returns conflict when adding duplicate work by name', async () => {
        const tx = {
            select: vi.fn(() => ({
                from: vi.fn(() => ({
                    where: vi.fn().mockResolvedValue([
                        { order: 100, kind: 'work', name: 'Штукатурка стен' },
                    ]),
                })),
            })),
            insert: vi.fn(),
            update: vi.fn(),
        };

        dbMock.transaction.mockImplementation(async (callback: (trx: typeof tx) => Promise<unknown>) => callback(tx));

        const result = await EstimateRowsService.addWork(7, 'est-1', {
            name: '  штукатурка стен ',
            unit: 'м2',
            qty: 1,
            price: 100,
            expense: 0,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.code).toBe('CONFLICT');
        }
        expect(tx.insert).not.toHaveBeenCalled();
    });

    it('returns conflict when adding duplicate material under same work', async () => {
        const tx = {
            query: {
                estimateRows: {
                    findFirst: vi.fn().mockResolvedValue({
                        id: 'work-1',
                        order: 100,
                        code: '1',
                        kind: 'work',
                    }),
                },
            },
            select: vi.fn(() => ({
                from: vi.fn(() => ({
                    where: vi.fn(() => ({
                        orderBy: vi.fn().mockResolvedValue([
                            { order: 101, name: 'Профиль маячковый' },
                        ]),
                    })),
                })),
            })),
            insert: vi.fn(),
            update: vi.fn(() => ({
                set: vi.fn(() => ({ where: vi.fn() })),
            })),
        };

        dbMock.transaction.mockImplementation(async (callback: (trx: typeof tx) => Promise<unknown>) => callback(tx));

        const result = await EstimateRowsService.addMaterial(7, 'est-1', 'work-1', {
            name: ' профиль маячковый ',
            unit: 'шт',
            qty: 1,
            price: 100,
            expense: 0,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.code).toBe('CONFLICT');
        }
        expect(tx.insert).not.toHaveBeenCalled();
    });
});
