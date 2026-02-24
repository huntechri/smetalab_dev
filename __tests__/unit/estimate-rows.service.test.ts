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
            query: {
                estimateRows: {
                    findFirst: vi.fn(),
                },
            },
            select: vi.fn(() => ({
                from: vi.fn(() => ({
                    where: vi.fn().mockResolvedValue([
                        { order: 100, kind: 'work', name: 'Штукатурка стен' },
                    ]),
                })),
            })),
            insert: vi.fn(),
            update: vi.fn(),
            execute: vi.fn().mockResolvedValue([]),
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


    it('inserts a work after selected work and keeps execution ordering consistent via order', async () => {
        const tx = {
            query: {
                estimates: {
                    findFirst: vi.fn().mockResolvedValue({ coefPercent: 0 }),
                },
                estimateRows: {
                    findFirst: vi.fn().mockResolvedValue({
                        id: 'w-new',
                        kind: 'work',
                        code: '2',
                        name: 'Новая работа',
                        unit: 'шт',
                        qty: 1,
                        price: 0,
                        sum: 0,
                        expense: 0,
                        order: 200,
                        parentWorkId: null,
                        materialId: null,
                        imageUrl: null,
                    }),
                },
            },
            select: vi
                .fn()
                .mockImplementationOnce(() => ({
                    from: vi.fn(() => ({
                        where: vi.fn().mockResolvedValue([
                            { order: 100, kind: 'work', name: 'Работа 1' },
                            { order: 200, kind: 'work', name: 'Работа 2' },
                        ]),
                    })),
                }))
                .mockImplementationOnce(() => ({
                    from: vi.fn(() => ({
                        where: vi.fn().mockResolvedValue([
                            { id: '11111111-1111-4111-8111-111111111111', order: 100, kind: 'work' },
                            { id: '22222222-2222-4222-8222-222222222222', order: 200, kind: 'work' },
                        ]),
                    })),
                }))
                .mockImplementationOnce(() => ({
                    from: vi.fn(() => ({
                        where: vi.fn(() => ({
                            orderBy: vi.fn().mockResolvedValue([
                                { id: '11111111-1111-4111-8111-111111111111', kind: 'work', parentWorkId: null, code: '1', order: 100 },
                                { id: 'w-new', kind: 'work', parentWorkId: null, code: '0', order: 200 },
                                { id: '22222222-2222-4222-8222-222222222222', kind: 'work', parentWorkId: null, code: '2', order: 300 },
                            ]),
                        })),
                    })),
                }))
                .mockImplementationOnce(() => ({
                    from: vi.fn(() => ({
                        where: vi.fn().mockResolvedValue([{ total: 0 }]),
                    })),
                })),
            update: vi.fn(() => ({
                set: vi.fn(() => ({ where: vi.fn() })),
            })),
            execute: vi.fn().mockResolvedValue([]),
            insert: vi.fn(() => ({
                values: vi.fn(() => ({
                    returning: vi.fn().mockResolvedValue([
                        {
                            id: 'w-new',
                            kind: 'work',
                            parentWorkId: null,
                            code: '0',
                            name: 'Новая работа',
                            materialId: null,
                            imageUrl: null,
                            unit: 'шт',
                            qty: 1,
                            price: 0,
                            sum: 0,
                            expense: 0,
                            order: 200,
                        },
                    ]),
                })),
            })),
        };

        dbMock.transaction.mockImplementation(async (callback: (trx: typeof tx) => Promise<unknown>) => callback(tx));

        const result = await EstimateRowsService.addWork(7, 'est-1', {
            name: 'Новая работа',
            insertAfterWorkId: '11111111-1111-4111-8111-111111111111',
        });

        expect(result.success).toBe(true);
        expect(tx.insert).toHaveBeenCalledTimes(1);
        expect(tx.query.estimateRows.findFirst).toHaveBeenCalled();
        expect(tx.update).toHaveBeenCalled();
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
            execute: vi.fn().mockResolvedValue([]),
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
