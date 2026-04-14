
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { db } from '@/lib/data/db/drizzle';
import { works, users, teams, teamMembers, NewWork } from '@/lib/data/db/schema';
import { createWork, updateWork, deleteWork, insertWorkAfter } from '@/app/actions/works/crud';
import { eq, and } from 'drizzle-orm';
import { WorksService } from '@/lib/domain/works/works.service';
import { getUser, getTeamForUser } from '@/lib/data/db/queries';
import { resetDatabase } from '@/lib/data/db/test-utils';

// --- Mocks ---
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/ai/embeddings', () => ({
    generateEmbedding: vi.fn().mockResolvedValue(new Array(1536).fill(0.1)),
}));

vi.mock('@/lib/data/db/queries', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as object),
        getUser: vi.fn(),
        getTeamForUser: vi.fn(),
    };
});

type MockedUser = NonNullable<Awaited<ReturnType<typeof getUser>>>;
type MockedTeam = NonNullable<Awaited<ReturnType<typeof getTeamForUser>>>;

describe('Works Integration Tests', () => {
    let testUserId: number;
    let testTeamId: number;

    beforeEach(async () => {
        // Global cleanup
        await resetDatabase();

        const [user] = await db.insert(users).values({
            name: 'Work User',
            email: `work-test-${Date.now()}@test.com`,
            passwordHash: 'hash',
        }).returning();
        testUserId = user.id;

        const [team] = await db.insert(teams).values({
            name: 'Work Team'
        }).returning();
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
            status: 'active'
        };

        const result = await createWork(data);

        expect(result.success).toBe(true);
        const inDb = await db.select().from(works).where(and(eq(works.code, 'W-001'), eq(works.tenantId, testTeamId)));
        expect(inDb).toHaveLength(1);
        expect(inDb[0].name).toBe('Test Work');
    });

    it('should_update_work_successfully', async () => {
        const [work] = await db.insert(works).values({
            tenantId: testTeamId,
            code: 'W-UPD',
            name: 'Old Name'
        }).returning();

        const result = await updateWork(work.id, { name: 'New Name' });

        expect(result.success).toBe(true);
        const [updated] = await db.select().from(works).where(eq(works.id, work.id));
        expect(updated.name).toBe('New Name');
    });


    it('should_store_code_sort_key_on_create_and_update', async () => {
        const createResult = await createWork({
            tenantId: testTeamId,
            code: '10.2',
            name: 'Natural code row',
            status: 'active',
        });

        expect(createResult.success).toBe(true);

        const [created] = await db.select().from(works)
            .where(and(eq(works.tenantId, testTeamId), eq(works.code, '10.2')));
        expect(created.codeSortKey).toBe('0000000010.0000000002');

        const updateResult = await updateWork(created.id, { code: 'X-100' });
        expect(updateResult.success).toBe(true);

        const [updated] = await db.select().from(works).where(eq(works.id, created.id));
        expect(updated.codeSortKey).toBe('~');
    });

    it('should_keep_ui_order_by_sort_order', async () => {
        await db.insert(works).values([
            { tenantId: testTeamId, code: '2.10', name: '2.10', sortOrder: 200, status: 'active' },
            { tenantId: testTeamId, code: '2.2', name: '2.2', sortOrder: 150, status: 'active' },
            { tenantId: testTeamId, code: 'ABC', name: 'ABC', sortOrder: 10, status: 'active' },
            { tenantId: testTeamId, code: 'ZZZ', name: 'ZZZ', sortOrder: 5, status: 'active' },
        ]);

        const result = await WorksService.getMany(testTeamId, 20);
        expect(result.success).toBe(true);
        if (!result.success) return;

        const orderedCodes = result.data.map((item) => item.code);
        expect(orderedCodes).toEqual(['ZZZ', 'ABC', '2.2', '2.10']);
    });

    it('should_handle_insert_after_correctly', async () => {
        // 1. Setup two existing works
        const [w1] = await db.insert(works).values({
            tenantId: testTeamId,
            code: 'W-1',
            name: 'Work 1',
            sortOrder: 100
        }).returning();

        await db.insert(works).values({
            tenantId: testTeamId,
            code: 'W-2',
            name: 'Work 2',
            sortOrder: 200
        });

        // 2. Insert new work after W1
        const newData: NewWork = {
            tenantId: testTeamId,
            code: 'W-NEW',
            name: 'Inserted Work'
        };

        const result = await insertWorkAfter(w1.id, newData);

        expect(result.success).toBe(true);

        // 3. Verify sort order (should be between 100 and 200)
        const [inserted] = await db.select().from(works).where(eq(works.code, 'W-NEW'));
        expect(inserted.sortOrder).toBeGreaterThan(100);
        expect(inserted.sortOrder).toBeLessThan(200);
    });

    it('should handle insert after null (at the end)', async () => {
        await db.insert(works).values({ tenantId: testTeamId, code: 'W1', name: 'W1', sortOrder: 100 }).returning();

        const result = await insertWorkAfter(null, { tenantId: testTeamId, code: 'W-END', name: 'End Work' });
        expect(result.success).toBe(true);
        const [inserted] = await db.select().from(works).where(eq(works.code, 'W-END'));
        expect(inserted.sortOrder).toBeGreaterThan(100);
    });

    it('should reset order correctly when using reorder service', async () => {
        await db.insert(works).values([
            { tenantId: testTeamId, code: 'W-A', name: 'W-A', sortOrder: 0.0001 },
            { tenantId: testTeamId, code: 'W-B', name: 'W-B', sortOrder: 0.0002 },
        ]);

        const result = await WorksService.reorder(testTeamId);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.updatedCount).toBe(2);
        }

        const sorted = await db.select().from(works).where(eq(works.tenantId, testTeamId)).orderBy(works.sortOrder);
        expect(sorted[0].sortOrder).toBe(100);
        expect(sorted[1].sortOrder).toBe(200);
    });

    it('should_delete_work_successfully', async () => {
        const [work] = await db.insert(works).values({
            tenantId: testTeamId,
            code: 'W-DEL',
            name: 'To Delete'
        }).returning();

        const result = await deleteWork(work.id);

        expect(result.success).toBe(true);
        const inDb = await db.select().from(works).where(eq(works.id, work.id));
        expect(inDb).toHaveLength(0);
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
