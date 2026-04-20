import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMock = vi.hoisted(() => ({
  execute: vi.fn(),
}));

vi.mock('@/lib/data/db/drizzle.node', () => ({
  db: dbMock,
}));

import { resetDatabase } from '@/lib/data/db/test-utils';

describe('resetDatabase safety guard', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    dbMock.execute.mockReset();
    dbMock.execute.mockResolvedValue([]);
    process.env.NODE_ENV = 'test';
    process.env.ALLOW_TEST_DB_CLEANUP = 'true';
  });

  it('blocks reset when TEST_DATABASE_URL is missing', async () => {
    process.env.DATABASE_URL = 'postgres://postgres:postgres@127.0.0.1:5432/smetalab_test';
    delete process.env.TEST_DATABASE_URL;

    await expect(resetDatabase()).rejects.toThrow('TEST_DATABASE_URL is required');
    expect(dbMock.execute).not.toHaveBeenCalled();
  });

  it('blocks reset when ALLOW_TEST_DB_CLEANUP is not enabled', async () => {
    process.env.TEST_DATABASE_URL = 'postgres://postgres:postgres@127.0.0.1:5432/neondb';
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    process.env.ALLOW_TEST_DB_CLEANUP = 'false';

    await expect(resetDatabase()).rejects.toThrow('ALLOW_TEST_DB_CLEANUP');
    expect(dbMock.execute).not.toHaveBeenCalled();
  });

  it('blocks reset when active connection does not match TEST_DATABASE_URL', async () => {
    process.env.TEST_DATABASE_URL = 'postgres://postgres:postgres@127.0.0.1:5432/neondb';
    process.env.DATABASE_URL = 'postgres://postgres:postgres@127.0.0.1:5432/smetalab_dev';

    await expect(resetDatabase()).rejects.toThrow('not using TEST_DATABASE_URL');
    expect(dbMock.execute).not.toHaveBeenCalled();
  });

  it('allows reset for valid neon-style URL without test marker when explicit cleanup flag is enabled', async () => {
    process.env.TEST_DATABASE_URL = 'postgres://user:pass@ep-example-12345.eu-central-1.aws.neon.tech:5432/neondb';
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

    await expect(resetDatabase()).resolves.toBeUndefined();
    expect(dbMock.execute).toHaveBeenCalled();
  });
});
