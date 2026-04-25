import { beforeEach, describe, expect, it, vi } from 'vitest';

const progressRefreshMock = vi.hoisted(() => vi.fn());

const dbMock = vi.hoisted(() => ({
    execute: vi.fn(),
    query: {
        estimates: {
            findFirst: vi.fn(),
        },
    },
    select: vi.fn(),
    update: vi.fn(),
    transaction: vi.fn(),
}));

vi.mock('@/lib/data/db/drizzle', () => ({ db: dbMock }));
vi.mock('@/lib/services/project-progress.service', () => ({
    ProjectProgressService: {
        refreshForProject: progressRefreshMock,
    },
}));

import { EstimateExecutionService, resetExecutionStorageReadyStateForTests } from '@/lib/services/estimate-execution.service';

describe('EstimateExecutionService sync behavior', () => {
    beforeEach(() => {
        dbMock.execute.mockReset();
        dbMock.query.estimates.findFirst.mockReset();
        dbMock.select.mockReset();
        dbMock.update.mockReset();
        dbMock.transaction.mockReset();
        progressRefreshMock.mockReset();
        resetExecutionStorageReadyStateForTests();

        dbMock.query.estimates.findFirst.mockResolvedValue({
            id: 'est-1',
            projectId: 'pr-1',
            coefPercent: 0,
            executionSyncVersion: 1,
            executionSyncedVersion: 1,
        });
    });

    it('returns MIGRATION_REQUIRED when execution table is missing', async () => {
        dbMock.execute.mockResolvedValueOnce([{ table_name: null }]);

        const result = await EstimateExecutionService.list(1, 'est-1');

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.code).toBe('MIGRATION_REQUIRED');
        }
    });

    it('does not perform writes or project refresh in list() when execution sync is up to date', async () => {
        dbMock.execute.mockResolvedValue([{ table_name: 'estimate_execution_rows' }]);
        const orderByMock = vi.fn().mockResolvedValue([]);
        dbMock.select.mockReturnValue({
            from: vi.fn(() => ({
                where: vi.fn(() => ({ orderBy: orderByMock })),
            })),
        });

        const result = await EstimateExecutionService.list(1, 'est-1');

        expect(result.success).toBe(true);
        expect(dbMock.transaction).not.toHaveBeenCalled();
        expect(dbMock.update).not.toHaveBeenCalled();
        expect(progressRefreshMock).not.toHaveBeenCalled();
    });

    it('syncs execution rows in list() when estimate sync version is stale', async () => {
        dbMock.execute.mockResolvedValue([{ table_name: 'estimate_execution_rows' }]);
        dbMock.query.estimates.findFirst.mockResolvedValue({
            id: 'est-1',
            projectId: 'pr-1',
            coefPercent: 0,
            executionSyncVersion: 5,
            executionSyncedVersion: 2,
        });

        const rows = [
            {
                id: 'exec-1',
                estimateRowId: 'work-1',
                source: 'from_estimate',
                status: 'not_started',
                code: '1',
                name: 'Работа 1',
                unit: 'м2',
                plannedQty: 3,
                plannedPrice: 120,
                plannedSum: 360,
                actualQty: 3,
                actualPrice: 120,
                actualSum: 360,
                isCompleted: false,
                order: 100,
            },
        ];

        const readRowsSelectMock = vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({ orderBy: vi.fn().mockResolvedValue(rows) })),
            })),
        }));
        dbMock.select.mockImplementation(readRowsSelectMock);

        dbMock.transaction.mockImplementation(async (callback: (tx: { execute: ReturnType<typeof vi.fn>; select: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; insert: ReturnType<typeof vi.fn> }) => Promise<unknown>) => {
            const tx = {
                execute: vi.fn().mockResolvedValue([
                    {
                        id: 'est-1',
                        project_id: 'pr-1',
                        coef_percent: 0,
                        execution_sync_version: 5,
                        execution_synced_version: 2,
                    },
                ]),
                select: vi.fn(() => ({
                    from: vi.fn(() => ({
                        where: vi.fn(() => ({ orderBy: vi.fn().mockResolvedValue([]) })),
                    })),
                })),
                update: vi.fn(() => ({
                    set: vi.fn(() => ({ where: vi.fn().mockResolvedValue([]) })),
                })),
                insert: vi.fn(),
            };

            return callback(tx);
        });

        const result = await EstimateExecutionService.list(1, 'est-1');

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(rows);
        }
        expect(dbMock.transaction).toHaveBeenCalledTimes(1);
        expect(dbMock.update).not.toHaveBeenCalled();
        expect(progressRefreshMock).not.toHaveBeenCalled();
    });

    it('syncAfterEstimateMutation only bumps version and defers execution-row sync', async () => {
        const dbUpdateWhereMock = vi.fn().mockResolvedValue([]);
        dbMock.update.mockReturnValue({
            set: vi.fn(() => ({ where: dbUpdateWhereMock })),
        });

        await EstimateExecutionService.syncAfterEstimateMutation(1, 'est-1');

        expect(dbMock.update).toHaveBeenCalledTimes(1);
        expect(dbUpdateWhereMock).toHaveBeenCalledTimes(1);
        expect(dbMock.transaction).not.toHaveBeenCalled();
        expect(dbMock.select).not.toHaveBeenCalled();
    });

    it('soft-deletes all generated execution rows when estimate has no works', async () => {
        dbMock.execute.mockResolvedValue([{ table_name: 'estimate_execution_rows' }]);

        const txUpdateWhereMock = vi.fn().mockResolvedValue([]);
        const txUpdateSetMock = vi.fn(() => ({ where: txUpdateWhereMock }));
        const txUpdateMock = vi.fn(() => ({ set: txUpdateSetMock }));
        const txSelectMock = vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({ orderBy: vi.fn().mockResolvedValue([]) })),
            })),
        }));

        dbMock.transaction.mockImplementation(async (callback: (tx: { execute: ReturnType<typeof vi.fn>; select: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; insert: ReturnType<typeof vi.fn> }) => Promise<unknown>) => {
            const tx = {
                execute: vi.fn().mockResolvedValue([
                    {
                        id: 'est-1',
                        project_id: 'pr-1',
                        coef_percent: 0,
                        execution_sync_version: 2,
                        execution_synced_version: 1,
                    },
                ]),
                select: txSelectMock,
                update: txUpdateMock,
                insert: vi.fn(),
            };

            return callback(tx);
        });

        await EstimateExecutionService.syncEstimateIfStale(1, 'est-1');

        expect(dbMock.transaction).toHaveBeenCalledTimes(1);
        expect(txSelectMock).toHaveBeenCalledTimes(1);
        expect(txUpdateMock).toHaveBeenCalledTimes(2);
    });

    it('syncEstimateIfStale writes once for concurrent calls', async () => {
        dbMock.execute.mockResolvedValue([{ table_name: 'estimate_execution_rows' }]);
        let executionSyncedVersion = 0;
        let queue = Promise.resolve();

        dbMock.transaction.mockImplementation(async (callback: (tx: { execute: ReturnType<typeof vi.fn>; select: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; insert: ReturnType<typeof vi.fn> }) => Promise<unknown>) => {
            const previous = queue;
            let release: () => void = () => undefined;
            queue = new Promise<void>((resolve) => {
                release = resolve;
            });

            await previous;

            const tx = {
                execute: vi.fn().mockResolvedValue([
                    {
                        id: 'est-1',
                        project_id: 'pr-1',
                        coef_percent: 0,
                        execution_sync_version: 1,
                        execution_synced_version: executionSyncedVersion,
                    },
                ]),
                select: vi.fn(() => ({
                    from: vi.fn(() => ({
                        where: vi.fn(() => ({ orderBy: vi.fn().mockResolvedValue([]) })),
                    })),
                })),
                update: vi.fn(() => ({
                    set: vi.fn(() => ({
                        where: vi.fn(() => {
                            executionSyncedVersion = 1;
                            return Promise.resolve([]);
                        }),
                    })),
                })),
                insert: vi.fn(),
            };

            try {
                return await callback(tx);
            } finally {
                release();
            }
        });

        await Promise.all([
            EstimateExecutionService.syncEstimateIfStale(1, 'est-1'),
            EstimateExecutionService.syncEstimateIfStale(1, 'est-1'),
        ]);

        expect(dbMock.transaction).toHaveBeenCalledTimes(2);
        expect(progressRefreshMock).not.toHaveBeenCalled();
    });

    it('updates factual price from estimate base price when syncing existing execution rows', async () => {
        dbMock.execute.mockResolvedValue([{ table_name: 'estimate_execution_rows' }]);

        const onConflictDoUpdateMock = vi.fn().mockResolvedValue([]);
        const insertValuesMock = vi.fn(() => ({ onConflictDoUpdate: onConflictDoUpdateMock }));
        const insertMock = vi.fn(() => ({ values: insertValuesMock }));

        dbMock.transaction.mockImplementation(async (callback: (tx: { execute: ReturnType<typeof vi.fn>; select: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; insert: ReturnType<typeof vi.fn> }) => Promise<unknown>) => {
            const tx = {
                execute: vi.fn().mockResolvedValue([
                    {
                        id: 'est-1',
                        project_id: 'pr-1',
                        coef_percent: 15,
                        execution_sync_version: 2,
                        execution_synced_version: 1,
                    },
                ]),
                select: vi.fn(() => ({
                    from: vi.fn(() => ({
                        where: vi.fn(() => ({
                            orderBy: vi.fn().mockResolvedValue([
                                {
                                    id: 'row-1',
                                    code: '1',
                                    name: 'Работа',
                                    unit: 'м2',
                                    qty: 2,
                                    price: 1000,
                                    sum: 2000,
                                    order: 10,
                                },
                            ]),
                        })),
                    })),
                })),
                update: vi.fn(() => ({
                    set: vi.fn(() => ({ where: vi.fn().mockResolvedValue([]) })),
                })),
                insert: insertMock,
            };

            return callback(tx);
        });

        await EstimateExecutionService.syncEstimateIfStale(1, 'est-1');

        expect(onConflictDoUpdateMock).toHaveBeenCalledTimes(1);
        const [{ set }] = onConflictDoUpdateMock.mock.calls[0] as Array<{ set: Record<string, unknown> }>;
        expect(set).toHaveProperty('actualPrice');
        expect(set).toHaveProperty('actualSum');
    });
});
