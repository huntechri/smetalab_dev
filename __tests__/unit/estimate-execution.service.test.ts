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

const migrateMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/data/db/drizzle', () => ({ db: dbMock }));
vi.mock('drizzle-orm/postgres-js/migrator', () => ({ migrate: migrateMock }));
vi.mock('@/lib/services/project-progress.service', () => ({
    ProjectProgressService: {
        refreshForProject: progressRefreshMock,
    },
}));

import { EstimateExecutionService } from '@/lib/services/estimate-execution.service';

describe('EstimateExecutionService sync behavior', () => {
    beforeEach(() => {
        dbMock.execute.mockReset();
        dbMock.query.estimates.findFirst.mockReset();
        dbMock.select.mockReset();
        dbMock.update.mockReset();
        dbMock.transaction.mockReset();
        migrateMock.mockReset();
        progressRefreshMock.mockReset();

        dbMock.query.estimates.findFirst.mockResolvedValue({ id: 'est-1', projectId: 'pr-1', coefPercent: 0 });
    });

    it('returns MIGRATION_REQUIRED when table is missing even after auto-migrate attempt', async () => {
        dbMock.execute.mockResolvedValueOnce([{ table_name: null }]).mockResolvedValueOnce([{ table_name: null }]);

        const result = await EstimateExecutionService.list(1, 'est-1');

        expect(migrateMock).toHaveBeenCalledTimes(1);
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
        dbMock.transaction.mockImplementation(async (callback: (tx: { execute: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; select: ReturnType<typeof vi.fn>; insert: ReturnType<typeof vi.fn> }) => Promise<unknown>) => {
            const tx = {
                execute: vi.fn().mockResolvedValue([
                    {
                        id: 'est-1',
                        project_id: 'pr-1',
                        coef_percent: 0,
                        execution_sync_version: 1,
                        execution_synced_version: 1,
                    },
                ]),
                update: vi.fn(() => ({
                    set: vi.fn(() => ({ where: vi.fn() })),
                })),
                select: vi.fn(),
                insert: vi.fn(),
            };

            return callback(tx);
        });

        const result = await EstimateExecutionService.list(1, 'est-1');

        expect(result.success).toBe(true);
        expect(dbMock.transaction).toHaveBeenCalledTimes(1);
        expect(dbMock.update).not.toHaveBeenCalled();
        expect(progressRefreshMock).not.toHaveBeenCalled();
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
});
