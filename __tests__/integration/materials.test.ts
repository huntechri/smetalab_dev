import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { and, eq, isNull } from 'drizzle-orm';
import { createMaterial, deleteAllMaterials, deleteMaterial, updateMaterial } from '@/app/actions/materials/crud';
import { db } from '@/lib/data/db/drizzle';
import { getTeamForUser, getUser } from '@/lib/data/db/queries';
import { materials, NewMaterial, teamMembers, teams, users } from '@/lib/data/db/schema';
import { resetDatabase } from '@/lib/data/db/test-utils';
import { MaterialsService } from '@/lib/domain/materials/materials.service';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/ai/embeddings', () => ({
  generateEmbedding: vi.fn().mockResolvedValue(new Array(1536).fill(0.1)),
  generateEmbeddingsBatch: vi.fn().mockResolvedValue([new Array(1536).fill(0.1)]),
}));
vi.mock('@/lib/data/db/queries', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...(actual as object), getUser: vi.fn(), getTeamForUser: vi.fn() };
});

type MockedUser = NonNullable<Awaited<ReturnType<typeof getUser>>>;
type MockedTeam = NonNullable<Awaited<ReturnType<typeof getTeamForUser>>>;

describe('Materials Integration Tests', () => {
  let testUserId: number;
  let testTeamId: number;

  const setupUserAndTeam = async () => {
    await resetDatabase();

    const [user] = await db.insert(users).values({
      name: 'Test Material User',
      email: `material-test-${Date.now()}@test.com`,
      passwordHash: 'x',
    }).returning();
    testUserId = user.id;

    const [team] = await db.insert(teams).values({ name: 'Material Test Team' }).returning();
    testTeamId = team.id;

    await db.insert(teamMembers).values({ userId: testUserId, teamId: testTeamId, role: 'admin' });

    vi.mocked(getUser).mockResolvedValue({ ...user, tenantId: testTeamId, teamRole: 'admin' } as MockedUser);
    vi.mocked(getTeamForUser).mockResolvedValue(team as MockedTeam);
  };

  const cleanupArgs = async () => {
    if (testTeamId) {
      await db.delete(materials).where(eq(materials.tenantId, testTeamId));
      await db.delete(teamMembers).where(eq(teamMembers.teamId, testTeamId));
      await db.delete(teams).where(eq(teams.id, testTeamId));
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
    vi.resetAllMocks();
  };

  beforeEach(setupUserAndTeam);
  afterEach(cleanupArgs);

  it('should_create_material_when_data_is_valid', async () => {
    const newMaterialData: NewMaterial = {
      code: 'M-001',
      name: 'Test Material',
      unit: 'pcs',
      price: 100,
      tenantId: testTeamId,
    };

    const result = await createMaterial(newMaterialData);

    expect(result.success).toBe(true);
    const inDb = await db.select().from(materials).where(and(eq(materials.code, 'm-001'), eq(materials.tenantId, testTeamId)));
    expect(inDb).toHaveLength(1);
    expect(inDb[0].name).toBe('Test Material');
  });

  it('should_update_material_successfully', async () => {
    const [created] = await db.insert(materials).values({
      tenantId: testTeamId,
      code: 'M-UPDATE',
      name: 'Original Name',
      price: 50,
    }).returning();

    const result = await updateMaterial(created.id, { name: 'Updated Name', price: 75 });

    expect(result.success).toBe(true);
    const updated = await db.select().from(materials).where(eq(materials.id, created.id));
    expect(updated[0].name).toBe('Updated Name');
    expect(updated[0].price).toBe(75);
  });

  it('should_delete_material_successfully', async () => {
    const [created] = await db.insert(materials).values({
      tenantId: testTeamId,
      code: 'M-DELETE',
      name: 'To Delete',
    }).returning();

    const result = await deleteMaterial(created.id);

    expect(result.success).toBe(true);
    const inDb = await db.select().from(materials).where(eq(materials.id, created.id));
    expect(inDb).toHaveLength(1);
    expect(inDb[0].deletedAt).toBeInstanceOf(Date);

    const activeRows = await db.select().from(materials).where(and(eq(materials.id, created.id), isNull(materials.deletedAt)));
    expect(activeRows).toHaveLength(0);
  });

  it('should_delete_all_materials_for_tenant', async () => {
    await db.insert(materials).values([
      { tenantId: testTeamId, code: 'M-1', name: 'M1' },
      { tenantId: testTeamId, code: 'M-2', name: 'M2' },
    ]);

    const result = await deleteAllMaterials();

    expect(result.success).toBe(true);
    const inDb = await db.select().from(materials).where(eq(materials.tenantId, testTeamId));
    expect(inDb).toHaveLength(2);
    expect(inDb.every((row) => row.deletedAt instanceof Date)).toBe(true);

    const activeRows = await db.select().from(materials).where(and(eq(materials.tenantId, testTeamId), isNull(materials.deletedAt)));
    expect(activeRows).toHaveLength(0);
  });

  it('should_append_new_materials_and_update_sort_order_on_upsert', async () => {
    await MaterialsService.upsertMany(testTeamId, [
      { tenantId: testTeamId, code: 'M-001', name: 'First', sortOrder: 100 },
      { tenantId: testTeamId, code: 'M-002', name: 'Second', sortOrder: 200 },
    ]);

    await MaterialsService.upsertMany(testTeamId, [
      { tenantId: testTeamId, code: 'M-002', name: 'Second moved', sortOrder: 100 },
      { tenantId: testTeamId, code: 'M-001', name: 'First moved', sortOrder: 200 },
      { tenantId: testTeamId, code: 'M-003', name: 'Third new', sortOrder: 300 },
    ]);

    const inDb = await db.select().from(materials).where(eq(materials.tenantId, testTeamId)).orderBy(materials.sortOrder);
    expect(inDb.map((item) => item.code)).toEqual(['m-002', 'm-001', 'm-003']);
    expect(inDb.find((item) => item.code === 'm-002')?.name).toBe('Second moved');
  });

  it('should_fail_when_user_is_not_authenticated', async () => {
    vi.mocked(getUser).mockResolvedValue(null);

    const result = await createMaterial({ code: 'FAIL', name: 'Fail', tenantId: testTeamId });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('UNAUTHORIZED');
    }
  });

  it('should_log_error_when_service_throws_exception', async () => {
    await createMaterial({ code: 'DUPLICATE', name: 'First', tenantId: testTeamId });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await createMaterial({ code: 'DUPLICATE', name: 'Second', tenantId: testTeamId });

    expect(result.success).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
    if (!result.success) {
      expect(result.error).toMatchObject({ message: 'Ошибка добавления' });
    }

    consoleSpy.mockRestore();
  });
});
