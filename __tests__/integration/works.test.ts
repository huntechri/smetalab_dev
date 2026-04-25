import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { and, eq, isNull } from 'drizzle-orm';
import { createWork, deleteWork, updateWork } from '@/app/actions/works/crud';
import { db } from '@/lib/data/db/drizzle';
import { getTeamForUser, getUser } from '@/lib/data/db/queries';
import { NewWork, teamMembers, teams, users, works } from '@/lib/data/db/schema';
import { resetDatabase } from '@/lib/data/db/test-utils';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/ai/embeddings', () => ({ generateEmbedding: vi.fn().mockResolvedValue(new Array(1536).fill(0.1)) }));
vi.mock('@/lib/data/db/queries', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...(actual as object), getUser: vi.fn(), getTeamForUser: vi.fn() };
});

type MockedUser = NonNullable<Awaited<ReturnType<typeof getUser>>>;
type MockedTeam = NonNullable<Awaited<ReturnType<typeof getTeamForUser>>>;

describe('Works Integration Tests', () => {
  let testUserId: number;
  let testTeamId: number;

  beforeEach(async () => {
    await resetDatabase();

    const [user] = await db.insert(users).values({
      name: 'Work User',
      email: `work-test-${Date.now()}@test.com`,
      passwordHash: 'hash',
    }).returning();
    testUserId = user.id;

    const [team] = await db.insert(teams).values({ name: 'Work Team' }).returning();
    testTeamId = team.id;

    await db.insert(teamMembers).values({ userId: testUserId, teamId: testTeamId, role: 'admin' });

    vi.mocked(getUser).mockResolvedValue({ ...user, tenantId: testTeamId, teamRole: 'admin' } as MockedUser);
    vi.mocked(getTeamForUser).mockResolvedValue(team as MockedTeam);
  });

  afterEach(async () => {
    if (testTeamId) {
      await db.delete(works).where(eq(works.tenantId, testTeamId));
      await db.delete(teamMembers).where(eq(teamMembers.teamId, testTeamId));
      await db.delete(teams).where(eq(teams.id, testTeamId));
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
    vi.resetAllMocks();
  });

  it('should_create_work_when_data_is_valid', async () => {
    const data: NewWork = {
      tenantId: testTeamId,
      code: 'W-001',
      name: 'Test Work',
      unit: 'm2',
      price: 500,
      status: 'active',
    };

    const result = await createWork(data);

    expect(result.success).toBe(true);
    const inDb = await db.select().from(works).where(and(eq(works.code, 'W-001'), eq(works.tenantId, testTeamId)));
    expect(inDb).toHaveLength(1);
    expect(inDb[0].name).toBe('Test Work');
  });

  it('should_update_work_successfully', async () => {
    const [work] = await db.insert(works).values({ tenantId: testTeamId, code: 'W-UPD', name: 'Old Name' }).returning();

    const result = await updateWork(work.id, { name: 'New Name' });

    expect(result.success).toBe(true);
    const [updated] = await db.select().from(works).where(eq(works.id, work.id));
    expect(updated.name).toBe('New Name');
  });

  it('should_delete_work_successfully', async () => {
    const [work] = await db.insert(works).values({ tenantId: testTeamId, code: 'W-DEL', name: 'To Delete' }).returning();

    const result = await deleteWork(work.id);

    expect(result.success).toBe(true);

    const inDb = await db.select().from(works).where(eq(works.id, work.id));
    expect(inDb).toHaveLength(1);
    expect(inDb[0].deletedAt).toBeInstanceOf(Date);

    const activeRows = await db.select().from(works).where(and(eq(works.id, work.id), isNull(works.deletedAt)));
    expect(activeRows).toHaveLength(0);
  });

  it('should_fail_when_unauthorized', async () => {
    vi.mocked(getUser).mockResolvedValue(null);

    const result = await createWork({ code: 'FAIL', name: 'Fail', tenantId: testTeamId });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('UNAUTHORIZED');
    }
  });
});
