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
    process.env.VITEST = 'true';
    delete process.env.CI;
  });

  it('blocks reset for non-test database URLs', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@db.prod.company:5432/smetalab';

    await expect(resetDatabase()).rejects.toThrow('Safety abort');
    expect(dbMock.execute).not.toHaveBeenCalled();
  });


  it('allows reset when TEST_DATABASE_URL is explicitly provided', async () => {
    process.env.TEST_DATABASE_URL = 'postgres://user:pass@ep-example-12345.eu-central-1.aws.neon.tech:5432/neondb';
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

    await expect(resetDatabase()).resolves.toBeUndefined();
    expect(dbMock.execute).toHaveBeenCalled();
  });

  it('allows reset for explicit test database URLs', async () => {
    process.env.DATABASE_URL = 'postgres://postgres:postgres@127.0.0.1:5432/smetalab_test';

    await expect(resetDatabase()).resolves.toBeUndefined();
    expect(dbMock.execute).toHaveBeenCalled();
  });
});
