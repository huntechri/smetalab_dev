
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { db } from '@/lib/data/db/drizzle';
import { works, users, teams, teamMembers, NewWork } from '@/lib/data/db/schema';
import { searchWorks } from '@/app/actions/works/search-ai';
import { WorksService } from '@/lib/domain/works/works.service';
import { eq } from 'drizzle-orm';
import { getUser, getTeamForUser } from '@/lib/data/db/queries';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { resetDatabase } from '@/lib/data/db/test-utils';
import { __queryEmbeddingsInternal } from '@/lib/ai/query-embeddings';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/ai/embeddings', () => ({ generateEmbedding: vi.fn() }));

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

describe('Works Search and Batch Operations', () => {
    let testUserId: number;
    let testTeamId: number;

    beforeEach(async () => {
        __queryEmbeddingsInternal.clearCache();
        // Global cleanup
        await resetDatabase();

        const [user] = await db.insert(users).values({
            name: 'Search User',
            email: `search-test-${Date.now()}@test.com`,
            passwordHash: 'hash',
        }).returning();
        testUserId = user.id;

        const [team] = await db.insert(teams).values({ name: 'Search Team' }).returning();
        testTeamId = team.id;

        await db.insert(teamMembers).values({ userId: testUserId, teamId: testTeamId, role: 'admin' });

        vi.mocked(getUser).mockResolvedValue({ ...user, tenantId: testTeamId, teamRole: 'admin' } as MockedUser);
        vi.mocked(getTeamForUser).mockResolvedValue(team as MockedTeam);
    });

    afterEach(async () => {
        __queryEmbeddingsInternal.clearCache();
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

    it('should search works using AI embeddings', async () => {
        // Arrange
        const mockVector = new Array(1536).fill(0.1);
        vi.mocked(generateEmbedding).mockResolvedValue(mockVector);

        await db.insert(works).values({
            tenantId: testTeamId,
            code: 'SEARCH-1',
            name: 'Specialized Painting Work',
            embedding: mockVector,
            status: 'active'
        });

        // Act
        const result = await searchWorks('painting');

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toHaveLength(1);
            expect(result.data[0].name).toBe('Specialized Painting Work');
        }
    });

    it('falls back to lexical search when query embedding generation fails', async () => {
        vi.mocked(generateEmbedding).mockResolvedValueOnce(null);

        await db.insert(works).values({
            tenantId: testTeamId,
            code: 'SEARCH-LEX-1',
            name: 'Ceiling Painting Work',
            status: 'active',
        });

        const result = await WorksService.search(testTeamId, 'ceiling painting');

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.some((item) => item.code === 'SEARCH-LEX-1')).toBe(true);
        }
    });

    it('should upsert many works correctly', async () => {
        // Arrange
        const manyWorks: NewWork[] = [
            { tenantId: testTeamId, code: 'B-1', name: 'Batch 1', sortOrder: 100 },
            { tenantId: testTeamId, code: 'B-2', name: 'Batch 2', sortOrder: 200 },
        ];

        // Act
        const result = await WorksService.upsertMany(testTeamId, manyWorks);

        // Assert
        expect(result.success).toBe(true);
        const inDb = await db.select().from(works).where(eq(works.tenantId, testTeamId)).orderBy(works.sortOrder);
        expect(inDb).toHaveLength(2);
        expect(inDb[0].code).toBe('B-1');
        expect(inDb[1].code).toBe('B-2');

        // Update one and add one
        const mixedWorks: NewWork[] = [
            { tenantId: testTeamId, code: 'B-1', name: 'Batch 1 Updated' },
            { tenantId: testTeamId, code: 'B-3', name: 'Batch 3' },
        ];

        await WorksService.upsertMany(testTeamId, mixedWorks);

        const afterUpdate = await db.select().from(works).where(eq(works.tenantId, testTeamId)).orderBy(works.sortOrder);
        expect(afterUpdate).toHaveLength(3);
        const updated = afterUpdate.find(w => w.code === 'B-1');
        expect(updated?.name).toBe('Batch 1 Updated');

        await WorksService.upsertMany(testTeamId, [
            { tenantId: testTeamId, code: 'B-2', name: 'Batch 2 Moved', sortOrder: 100 },
            { tenantId: testTeamId, code: 'B-1', name: 'Batch 1 Moved', sortOrder: 200 },
            { tenantId: testTeamId, code: 'B-3', name: 'Batch 3 Moved', sortOrder: 300 },
        ]);

        const reordered = await db.select().from(works).where(eq(works.tenantId, testTeamId)).orderBy(works.sortOrder);
        expect(reordered.map((item) => item.code)).toEqual(['B-2', 'B-1', 'B-3']);
    });

    it('matches multi-word prefix queries in regular catalog search', async () => {
        await db.insert(works).values({
            tenantId: testTeamId,
            code: 'W-PR-001',
            name: 'Подвес прямой монтаж',
            status: 'active',
            sortOrder: 100,
        });

        const result = await WorksService.getMany(testTeamId, 200, 'подвес пр');

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.some((row) => row.name === 'Подвес прямой монтаж')).toBe(true);
        }
    });
});
