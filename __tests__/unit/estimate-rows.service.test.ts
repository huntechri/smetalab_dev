import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMock = vi.hoisted(() => ({
    query: {
        estimates: {
            findFirst: vi.fn(),
        },
    },
    transaction: vi.fn(),
}));

const executionServiceMocks = vi.hoisted(() => ({
    bumpSyncVersion: vi.fn(),
    syncEstimateIfStale: vi.fn(),
}));

vi.mock('@/lib/data/db/drizzle', () => ({
    db: dbMock,
}));

vi.mock('@/lib/services/estimate-execution.service', () => ({
    EstimateExecutionService: executionServiceMocks,
}));

import { EstimateRowsService } from '@/lib/services/estimate-rows.service';

describe('EstimateRowsService duplicate protection', () => {
    beforeEach(() => {
        dbMock.query.estimates.findFirst.mockReset();
        dbMock.transaction.mockReset();
        executionServiceMocks.bumpSyncVersion.mockReset();
        executionServiceMocks.syncEstimateIfStale.mockReset();
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
                    where: vi.fn(() => ({
                        limit: vi.fn().mockResolvedValue([{ id: 'dup-work-id' }]),
                    })),
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



    it('adds work at the end without renumbering existing rows', async () => {
        const tx = {
            query: {
                estimateRows: {
                    findFirst: vi.fn(),
                },
            },
            select: vi
                .fn()
                .mockImplementationOnce(() => ({
                    from: vi.fn(() => ({
                        where: vi.fn(() => ({
                            limit: vi.fn().mockResolvedValue([]),
                        })),
                    })),
                }))
                .mockImplementationOnce(() => ({
                    from: vi.fn(() => ({
                        where: vi.fn().mockResolvedValue([{ maxOrder: 300, worksCount: 3 }]),
                    })),
                })),
            insert: vi.fn(() => ({
                values: vi.fn(() => ({
                    returning: vi.fn().mockResolvedValue([
                        {
                            id: 'w-new',
                            kind: 'work',
                            parentWorkId: null,
                            code: '4',
                            name: 'Новая работа',
                            materialId: null,
                            imageUrl: null,
                            unit: 'шт',
                            qty: 1,
                            price: 0,
                            sum: 0,
                            expense: 0,
                            order: 400,
                        },
                    ]),
                })),
            })),
            update: vi.fn(() => ({
                set: vi.fn(() => ({ where: vi.fn() })),
            })),
            execute: vi.fn(),
        };

        dbMock.transaction.mockImplementation(async (callback: (trx: typeof tx) => Promise<unknown>) => callback(tx));

        const result = await EstimateRowsService.addWork(7, 'est-1', {
            name: 'Новая работа',
        });

        expect(result.success).toBe(true);
        expect(tx.insert).toHaveBeenCalledTimes(1);
        expect(tx.query.estimateRows.findFirst).not.toHaveBeenCalled();
        expect(tx.execute).not.toHaveBeenCalled();
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
                            { id: '11111111-1111-4111-8111-111111111111', order: 100, kind: 'work', name: 'Работа 1' },
                            { id: '22222222-2222-4222-8222-222222222222', order: 200, kind: 'work', name: 'Работа 2' },
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



    it('removes section without deleting works/materials', async () => {
        const tx = {
            query: {
                estimateRows: {
                    findFirst: vi.fn().mockResolvedValue({
                        id: 'section-1',
                        estimateId: 'est-1',
                        kind: 'section',
                        order: 999,
                    }),
                },
            },
            select: vi
                .fn()
                .mockImplementationOnce(() => ({
                    from: vi.fn(() => ({
                        where: vi.fn().mockResolvedValue([{ kind: 'section', sum: 0 }]),
                    })),
                }))
                .mockImplementationOnce(() => ({
                    from: vi.fn(() => ({
                        where: vi.fn(() => ({
                            orderBy: vi.fn().mockResolvedValue([]),
                        })),
                    })),
                })),
            update: vi.fn(() => ({
                set: vi.fn(() => ({ where: vi.fn() })),
            })),
            execute: vi.fn().mockResolvedValue([]),
        };

        dbMock.transaction.mockImplementation(async (callback: (trx: typeof tx) => Promise<unknown>) => callback(tx));

        const result = await EstimateRowsService.remove(7, 'est-1', 'section-1');

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.removedIds).toEqual(['section-1']);
        }
        expect(executionServiceMocks.bumpSyncVersion).not.toHaveBeenCalled();
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

describe('EstimateRowsService.patch calculation and rounding', () => {
    beforeEach(() => {
        dbMock.query.estimates.findFirst.mockReset();
        dbMock.transaction.mockReset();
        dbMock.query.estimates.findFirst.mockResolvedValue({ id: 'est-1', coefPercent: 0 });
    });

    it('rounds material quantity UP to nearest integer when work quantity changes (cascading)', async () => {
        const updateMock = {
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([{ id: 'updated-id' }]),
        };

        const tx = {
            query: {
                estimates: {
                    findFirst: vi.fn().mockResolvedValue({ coefPercent: 0 }),
                },
                estimateRows: {
                    findFirst: vi.fn().mockResolvedValue({
                        id: 'work-1',
                        kind: 'work',
                        qty: 10,
                        price: 100,
                        sum: 1000,
                        estimateId: 'est-1',
                    }),
                },
            },
            select: vi.fn(() => ({
                from: vi.fn(() => ({
                    where: vi.fn().mockResolvedValue([
                        {
                            id: 'mat-1',
                            kind: 'material',
                            parentWorkId: 'work-1',
                            estimateId: 'est-1',
                            qty: 5,
                            expense: 0.5,
                            price: 200,
                            sum: 1000,
                            deletedAt: null,
                        },
                    ]),
                })),
            })),
            update: vi.fn(() => updateMock),
        };

        dbMock.transaction.mockImplementation(async (callback: (trx: typeof tx) => Promise<unknown>) => callback(tx));

        // Change work qty from 10 to 11.
        // Material qty = 11 * 0.5 = 5.5.
        // With Math.ceil, it should become 6.
        await EstimateRowsService.patch(7, 'est-1', 'work-1', { qty: 11 });

        // 1. Work update
        // 2. Material cascading update
        // 3. Estimate total update
        expect(tx.update).toHaveBeenCalledTimes(3);
        
        // Verify the cascading update for the material (2nd call to update)
        // Note: the index of calls depends on the order in the code.
        const materialUpdateSet = updateMock.set.mock.calls[1][0];
        // 11 * 0.5 = 5.5, should be 6
        expect(materialUpdateSet).toMatchObject({ qty: 6 });
    });

    it('builds searched CASE SQL for bulk child recalculation without comparing uuid to boolean', async () => {
        const updateMock = {
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([{ id: 'updated-id' }]),
        };

        const tx = {
            query: {
                estimates: {
                    findFirst: vi.fn().mockResolvedValue({ coefPercent: 0 }),
                },
                estimateRows: {
                    findFirst: vi.fn().mockResolvedValue({
                        id: 'work-1',
                        kind: 'work',
                        qty: 10,
                        price: 100,
                        sum: 1000,
                        estimateId: 'est-1',
                    }),
                },
            },
            select: vi.fn(() => ({
                from: vi.fn(() => ({
                    where: vi.fn().mockResolvedValue([
                        {
                            id: 'mat-1',
                            kind: 'material',
                            parentWorkId: 'work-1',
                            estimateId: 'est-1',
                            qty: 5,
                            expense: 0.5,
                            price: 200,
                            sum: 1000,
                            deletedAt: null,
                        },
                        {
                            id: 'mat-2',
                            kind: 'material',
                            parentWorkId: 'work-1',
                            estimateId: 'est-1',
                            qty: 3,
                            expense: 0.3,
                            price: 300,
                            sum: 900,
                            deletedAt: null,
                        },
                    ]),
                })),
            })),
            update: vi.fn(() => updateMock),
        };

        dbMock.transaction.mockImplementation(async (callback: (trx: typeof tx) => Promise<unknown>) => callback(tx));

        await EstimateRowsService.patch(7, 'est-1', 'work-1', { qty: 11 });

        const bulkSetPayload = updateMock.set.mock.calls[1][0] as { qty: { queryChunks: unknown[] } };
        const qtyCaseExpression = bulkSetPayload.qty;

        expect(qtyCaseExpression).toHaveProperty('queryChunks');
        expect(qtyCaseExpression.queryChunks[1]).toHaveProperty('queryChunks');
    });
});
