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
    const { ensureWorksCodeSortKeyColumn, resetSchemaCompatibilityStateForTests } = await import('@/lib/data/db/schema-compat');
    resetSchemaCompatibilityStateForTests();

    executeMock.mockResolvedValue(undefined);

    await ensureWorksCodeSortKeyColumn();
    await ensureWorksCodeSortKeyColumn();

    expect(executeMock).toHaveBeenCalledTimes(2);
  });

  it('retries after failed ensure call', async () => {
    const { ensureWorksCodeSortKeyColumn, resetSchemaCompatibilityStateForTests } = await import('@/lib/data/db/schema-compat');
    resetSchemaCompatibilityStateForTests();

    executeMock.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(undefined);

    await expect(ensureWorksCodeSortKeyColumn()).rejects.toThrow('boom');
    await ensureWorksCodeSortKeyColumn();

    expect(executeMock).toHaveBeenCalledTimes(3);
  });
});
