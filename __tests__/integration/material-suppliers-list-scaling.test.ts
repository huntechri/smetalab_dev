import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/data/db/drizzle';
import { materialSuppliers, teamMembers, teams, users } from '@/lib/data/db/schema';
import { getUser, getTeamForUser } from '@/lib/data/db/queries';
import { getMaterialSuppliersPage } from '@/lib/data/db/material-suppliers-queries';
import { deleteMaterialSupplier, updateMaterialSupplier } from '@/app/actions/material-suppliers';
import { eq } from 'drizzle-orm';
import { resetDatabase } from '@/lib/data/db/test-utils';

vi.mock('@/lib/data/db/queries', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...(actual as object), getUser: vi.fn(), getTeamForUser: vi.fn() };
});

describe('Material suppliers list scaling', () => {
  let testUserId: number;
  let testTeamId: number;

  beforeEach(async () => {
    await resetDatabase();

    const [user] = await db.insert(users).values({
      name: 'Scale Supplier User',
      email: `scale-ms-${Date.now()}@test.com`,
      passwordHash: 'hash',
    }).returning();

    const [team] = await db.insert(teams).values({ name: 'Scale MS Team' }).returning();

    testUserId = user.id;
    testTeamId = team.id;

    await db.insert(teamMembers).values({ userId: testUserId, teamId: testTeamId, role: 'admin' });

    vi.mocked(getUser).mockResolvedValue({ ...user, tenantId: testTeamId, teamRole: 'admin' } as never);
    vi.mocked(getTeamForUser).mockResolvedValue(team as never);

    const suppliers = Array.from({ length: 5105 }, (_, index) => ({
      tenantId: testTeamId,
      name: index === 3200 ? 'Target Supplier 3200' : `Scale Supplier ${String(index).padStart(4, '0')}`,
      color: '#3B82F6',
      legalStatus: 'company' as const,
      inn: `7700${String(index).padStart(6, '0')}`,
      kpp: `7800${String(index).padStart(6, '0')}`,
    }));

    for (let i = 0; i < suppliers.length; i += 500) {
      await db.insert(materialSuppliers).values(suppliers.slice(i, i + 500));
    }
  });

  afterEach(async () => {
    vi.resetAllMocks();
  });

  it('supports pagination, search, edit and delete with 5k+ records', async () => {
    const firstPage = await getMaterialSuppliersPage(testTeamId, { limit: 100, offset: 0 });
    expect(firstPage.data).toHaveLength(100);
    expect(firstPage.count).toBe(5105);
    expect(firstPage.hasMore).toBe(true);

    const searchResult = await getMaterialSuppliersPage(testTeamId, { limit: 50, offset: 0, search: 'Target Supplier 3200' });
    expect(searchResult.count).toBe(1);
    expect(searchResult.data).toHaveLength(1);

    const target = searchResult.data[0];

    const updateResult = await updateMaterialSupplier({
      id: target.id,
      data: {
        name: 'Target Supplier Updated',
        color: '#111111',
        legalStatus: 'company',
        inn: target.inn || '',
        kpp: target.kpp || '',
      },
    });

    expect(updateResult.success).toBe(true);

    const updatedSearch = await getMaterialSuppliersPage(testTeamId, { limit: 10, offset: 0, search: 'Target Supplier Updated' });
    expect(updatedSearch.count).toBe(1);

    const deleteResult = await deleteMaterialSupplier(target.id);
    expect(deleteResult.success).toBe(true);

    const deletedRow = await db.select().from(materialSuppliers).where(eq(materialSuppliers.id, target.id));
    expect(deletedRow[0].deletedAt).not.toBeNull();

    const afterDeleteSearch = await getMaterialSuppliersPage(testTeamId, { limit: 10, offset: 0, search: 'Target Supplier Updated' });
    expect(afterDeleteSearch.count).toBe(0);
  });
});
