import { beforeEach, describe, expect, it, vi } from 'vitest';

const executeMock = vi.fn();

vi.mock('@/lib/data/db/drizzle', () => ({
  db: {
    execute: executeMock,
  },
}));

describe('schema compatibility helpers', () => {
  beforeEach(() => {
    executeMock.mockReset();
  });

  it('runs compatibility SQL only once across repeated calls', async () => {
    const { ensureWorksCodeSortKeyColumn, ensureMaterialsSortOrderColumn, resetSchemaCompatibilityStateForTests } = await import('@/lib/data/db/schema-compat');
    resetSchemaCompatibilityStateForTests();

    executeMock.mockResolvedValue([{ exists: true }]);

    await ensureWorksCodeSortKeyColumn();
    await ensureWorksCodeSortKeyColumn();
    await ensureMaterialsSortOrderColumn();
    await ensureMaterialsSortOrderColumn();

    expect(executeMock).toHaveBeenCalledTimes(2);
  });

  it('retries after failed ensure call', async () => {
    const { ensureWorksCodeSortKeyColumn, ensureMaterialsSortOrderColumn, resetSchemaCompatibilityStateForTests } = await import('@/lib/data/db/schema-compat');
    resetSchemaCompatibilityStateForTests();

    executeMock.mockRejectedValueOnce(new Error('boom')).mockResolvedValue([{ exists: true }]);

    await expect(ensureWorksCodeSortKeyColumn()).rejects.toThrow('boom');
    await ensureWorksCodeSortKeyColumn();
    await ensureMaterialsSortOrderColumn();

    expect(executeMock).toHaveBeenCalledTimes(3);
  });
});
