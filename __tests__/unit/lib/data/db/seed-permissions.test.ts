import { beforeEach, describe, expect, it, vi } from 'vitest';

import { permissions, platformRolePermissions, rolePermissions } from '@/lib/data/db/schema';

const inserts: Array<{ table: unknown; values: unknown[] }> = [];

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(),
}));

vi.mock('@/lib/data/db/drizzle.node', () => ({
  db: dbMock,
}));

import { seedPermissions } from '@/lib/data/db/seed-permissions';

function toValuesArray<T>(values: T | T[]): T[] {
  return Array.isArray(values) ? values : [values];
}

describe('seedPermissions', () => {
  beforeEach(() => {
    inserts.length = 0;
    dbMock.transaction.mockReset();

    dbMock.transaction.mockImplementation(async (callback: (tx: unknown) => Promise<void>) => {
      const tx = {
        delete: vi.fn().mockResolvedValue(undefined),
        insert: vi.fn((table: unknown) => ({
          values: (values: unknown | unknown[]) => {
            const normalizedValues = toValuesArray(values);
            inserts.push({ table, values: normalizedValues });

            return {
              returning: async () =>
                normalizedValues.map((row, index) => ({ id: index + 1, code: (row as { code: string }).code })),
            };
          },
        })),
      };

      await callback(tx);
    });
  });

  it('seeds tenant permissions for owner and member roles', async () => {
    await seedPermissions();

    const tenantRoleInserts = inserts.filter((item) => item.table === rolePermissions);
    expect(tenantRoleInserts.length).toBeGreaterThan(0);

    const roles = new Set(
      tenantRoleInserts
        .flatMap((item) => item.values)
        .map((row) => (row as { role: string }).role),
    );
    expect(roles.has('owner')).toBe(true);
    expect(roles.has('member')).toBe(true);
  });

  it('seeds platform permissions as before', async () => {
    await seedPermissions();

    const platformInserts = inserts.filter((item) => item.table === platformRolePermissions);
    expect(platformInserts.length).toBeGreaterThan(0);

    const roles = new Set(
      platformInserts
        .flatMap((item) => item.values)
        .map((row) => (row as { platformRole: string }).platformRole),
    );
    expect(roles).toEqual(new Set(['superadmin', 'support']));
  });

  it('creates base permission catalog before mappings', async () => {
    await seedPermissions();

    expect(inserts[0]?.table).toBe(permissions);
    expect(inserts[0]?.values.length).toBeGreaterThan(0);
  });
});
