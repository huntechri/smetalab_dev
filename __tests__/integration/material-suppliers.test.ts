import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { db } from '@/lib/data/db/drizzle';
import { materialSuppliers, users, teams, teamMembers, activityLogs } from '@/lib/data/db/schema';
import { createMaterialSupplier, updateMaterialSupplier, deleteMaterialSupplier } from '@/app/actions/material-suppliers/crud';
import { eq, and } from 'drizzle-orm';
import { getUser, getTeamForUser } from '@/lib/data/db/queries';
import { resetDatabase } from '@/lib/data/db/test-utils';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/data/db/queries', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...(actual as object), getUser: vi.fn(), getTeamForUser: vi.fn() };
});

describe('Material suppliers integration', () => {
  let testUserId: number;
  let testTeamId: number;

  beforeEach(async () => {
    await resetDatabase();
    const [user] = await db.insert(users).values({ name: 'Supplier User', email: `ms-${Date.now()}@test.com`, passwordHash: 'hash' }).returning();
    testUserId = user.id;
    const [team] = await db.insert(teams).values({ name: 'MS Team' }).returning();
    testTeamId = team.id;
    await db.insert(teamMembers).values({ userId: testUserId, teamId: testTeamId, role: 'admin' });
    vi.mocked(getUser).mockResolvedValue({ ...user, tenantId: testTeamId, teamRole: 'admin' } as never);
    vi.mocked(getTeamForUser).mockResolvedValue(team as never);
  });

  afterEach(async () => vi.resetAllMocks());

  it('creates material supplier', async () => {
    const result = await createMaterialSupplier({ name: 'ООО Руда', color: '#3B82F6', legalStatus: 'company', inn: '7700123456', kpp: '770001001' });
    expect(result.success).toBe(true);
    const rows = await db.select().from(materialSuppliers).where(and(eq(materialSuppliers.name, 'ООО Руда'), eq(materialSuppliers.tenantId, testTeamId)));
    expect(rows).toHaveLength(1);
    const logs = await db.select().from(activityLogs).where(eq(activityLogs.teamId, testTeamId));
    expect(logs.some((l) => l.action.includes('Created material supplier'))).toBe(true);
  });

  it('updates material supplier', async () => {
    const [item] = await db.insert(materialSuppliers).values({ tenantId: testTeamId, name: 'Old', color: '#3B82F6', legalStatus: 'company' }).returning();
    const result = await updateMaterialSupplier({ id: item.id, data: { name: 'New', color: '#111111', legalStatus: 'company' } });
    expect(result.success).toBe(true);
    const [updated] = await db.select().from(materialSuppliers).where(eq(materialSuppliers.id, item.id));
    expect(updated.name).toBe('New');
  });

  it('soft deletes material supplier', async () => {
    const [item] = await db.insert(materialSuppliers).values({ tenantId: testTeamId, name: 'To delete', color: '#3B82F6', legalStatus: 'individual' }).returning();
    const result = await deleteMaterialSupplier(item.id);
    expect(result.success).toBe(true);
    const [deleted] = await db.select().from(materialSuppliers).where(eq(materialSuppliers.id, item.id));
    expect(deleted.deletedAt).not.toBeNull();
  });
});
