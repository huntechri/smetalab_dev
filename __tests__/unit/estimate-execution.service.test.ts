import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMock = vi.hoisted(() => ({
    execute: vi.fn(),
    query: {
        estimates: {
            findFirst: vi.fn(),
        },
    },
}));

const migrateMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/data/db/drizzle', () => ({
    db: dbMock,
}));

vi.mock('drizzle-orm/postgres-js/migrator', () => ({
    migrate: migrateMock,
}));

import { EstimateExecutionService } from '@/lib/services/estimate-execution.service';

describe('EstimateExecutionService migration sync behavior', () => {
    beforeEach(() => {
        dbMock.execute.mockReset();
        dbMock.query.estimates.findFirst.mockReset();
        migrateMock.mockReset();

        dbMock.query.estimates.findFirst.mockResolvedValue({ id: 'est-1' });
    });

    it('returns MIGRATION_REQUIRED when table is missing even after auto-migrate attempt', async () => {
        dbMock.execute
            .mockResolvedValueOnce([{ table_name: null }])
            .mockResolvedValueOnce([{ table_name: null }]);

        const result = await EstimateExecutionService.list(1, 'est-1');

        expect(migrateMock).toHaveBeenCalledTimes(1);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.code).toBe('MIGRATION_REQUIRED');
        }
    });
});
