import { describe, expect, it } from 'vitest';

import {
  assertDbSyncSafety,
  buildDbSyncCommands,
  resolveDbSyncOptions,
} from '@/lib/data/db/db-sync';

describe('db-sync helpers', () => {
  it('enables migration generation by default', () => {
    const options = resolveDbSyncOptions([]);

    expect(options).toEqual({ skipGenerate: false, allowProduction: false });
    expect(buildDbSyncCommands(options)).toEqual([
      ['pnpm', 'db:generate'],
      ['pnpm', 'db:migrate'],
    ]);
  });

  it('supports skip-generate and allow-production options', () => {
    const options = resolveDbSyncOptions(['--skip-generate', '--allow-production']);

    expect(options).toEqual({ skipGenerate: true, allowProduction: true });
    expect(buildDbSyncCommands(options)).toEqual([['pnpm', 'db:migrate']]);
  });

  it('blocks likely production urls by default', () => {
    const options = resolveDbSyncOptions([]);

    expect(() =>
      assertDbSyncSafety(
        options,
        'postgresql://user:pass@ep-main.neon.tech/neondb?sslmode=require',
        'postgresql://user:pass@ep-test.neon.tech/neondb?sslmode=require',
      ),
    ).toThrow(/Safety abort/);
  });

  it('allows sync when using test database url', () => {
    const options = resolveDbSyncOptions([]);
    const testUrl = 'postgresql://user:pass@ep-test.neon.tech/neondb?sslmode=require';

    expect(() => assertDbSyncSafety(options, testUrl, testUrl)).not.toThrow();
  });
});
