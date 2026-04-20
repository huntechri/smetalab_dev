import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { db } from '@/lib/data/db/drizzle';
import { materials, users, teams, teamMembers } from '@/lib/data/db/schema';
import { MaterialsService } from '@/lib/domain/materials/materials.service';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { __queryEmbeddingsInternal } from '@/lib/ai/query-embeddings';
import { eq, sql } from 'drizzle-orm';
import { getUser, getTeamForUser } from '@/lib/data/db/queries';
import { resetDatabase } from '@/lib/data/db/test-utils';

vi.mock('@/lib/ai/embeddings', () => ({
    generateEmbedding: vi.fn().mockResolvedValue(new Array(1536).fill(0.01)),
    generateEmbeddingsBatch: vi.fn().mockResolvedValue([new Array(1536).fill(0.01)]),
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

describe('Materials search integration', () => {
    let testUserId: number;
    let testTeamId: number;

    const setupUserAndTeam = async () => {
        await resetDatabase();

        const [user] = await db.insert(users).values({
            name: 'Search User',
            email: `material-search-${Date.now()}@test.com`,
            passwordHash: 'hashed_password',
        }).returning();
        testUserId = user.id;

        const [team] = await db.insert(teams).values({
            name: 'Search Team',
        }).returning();
        testTeamId = team.id;

        await db.insert(teamMembers).values({
            userId: testUserId,
            teamId: testTeamId,
            role: 'admin',
        });

        vi.mocked(getUser).mockResolvedValue({ ...user, tenantId: testTeamId, teamRole: 'admin' } as MockedUser);
        vi.mocked(getTeamForUser).mockResolvedValue(team as MockedTeam);
    };

    const cleanup = async () => {
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

    beforeEach(async () => {
        __queryEmbeddingsInternal.clearCache();
        await setupUserAndTeam();
    });

    afterEach(async () => {
        __queryEmbeddingsInternal.clearCache();
        await cleanup();
    });

    it('recomputes search_vector on insert and update', async () => {
        const [material] = await db.insert(materials).values({
            tenantId: testTeamId,
            code: 'TRIG-001',
            name: 'Trigger Cement',
            vendor: 'Acme',
            status: 'active',
        }).returning();

        const [insertMatch] = await db.select({
            matches: sql<boolean>`search_vector @@ websearch_to_tsquery('simple', 'cement')`,
        })
            .from(materials)
            .where(eq(materials.id, material.id));

        expect(insertMatch?.matches).toBe(true);

        await db.update(materials)
            .set({ name: 'Updated Gravel' })
            .where(eq(materials.id, material.id));

        const [updateMatch] = await db.select({
            matches: sql<boolean>`search_vector @@ websearch_to_tsquery('simple', 'gravel')`,
        })
            .from(materials)
            .where(eq(materials.id, material.id));

        expect(updateMatch?.matches).toBe(true);
    });

    it('orders search results by score', async () => {
        const [cement] = await db.insert(materials).values({
            tenantId: testTeamId,
            code: 'C-001',
            name: 'Premium Cement',
            status: 'active',
        }).returning();

        const [brick] = await db.insert(materials).values({
            tenantId: testTeamId,
            code: 'B-001',
            name: 'Red Brick',
            status: 'active',
        }).returning();

        await db.execute(sql`
            UPDATE materials
            SET search_vector = to_tsvector('simple', ${cement.name})
            WHERE id = ${cement.id}
        `);
        await db.execute(sql`
            UPDATE materials
            SET search_vector = to_tsvector('simple', ${brick.name})
            WHERE id = ${brick.id}
        `);

        const result = await MaterialsService.search(testTeamId, 'cement');
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data[0]?.id).toBe(cement.id);
        }
    });

    it('uses embeddings for queries with two tokens or more', async () => {
        const generateEmbeddingMock = vi.mocked(generateEmbedding);
        generateEmbeddingMock.mockClear();
        generateEmbeddingMock.mockResolvedValue(new Array(1536).fill(0.01));

        const result = await MaterialsService.search(testTeamId, 'red brick');

        expect(result.success).toBe(true);
        expect(generateEmbeddingMock).toHaveBeenCalledTimes(1);
    });

    it('uses embeddings for queries with three tokens or more', async () => {
        const generateEmbeddingMock = vi.mocked(generateEmbedding);
        generateEmbeddingMock.mockClear();
        generateEmbeddingMock.mockResolvedValue(new Array(1536).fill(0.01));

        const result = await MaterialsService.search(testTeamId, 'red brick wall');

        expect(result.success).toBe(true);
        expect(generateEmbeddingMock).toHaveBeenCalledTimes(1);
    });

    it('falls back to lexical search when query embedding generation fails', async () => {
        const generateEmbeddingMock = vi.mocked(generateEmbedding);
        generateEmbeddingMock.mockClear();
        generateEmbeddingMock.mockResolvedValueOnce(null);

        await db.insert(materials).values({
            tenantId: testTeamId,
            code: 'F-001',
            name: 'Red Brick Wall Panel',
            status: 'active',
        });

        const result = await MaterialsService.search(testTeamId, 'red brick wall');

        expect(generateEmbeddingMock).toHaveBeenCalledTimes(1);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.some((item) => item.code === 'F-001')).toBe(true);
        }
    });

    it('uses deterministic tie-breakers for equal scores', async () => {
        const [alpha] = await db.insert(materials).values({
            tenantId: testTeamId,
            code: 'A-100',
            name: 'Fine Sand',
            status: 'active',
        }).returning();

        const [beta] = await db.insert(materials).values({
            tenantId: testTeamId,
            code: 'B-100',
            name: 'Fine Sand',
            status: 'active',
        }).returning();

        await db.execute(sql`
            UPDATE materials
            SET search_vector = to_tsvector('simple', ${alpha.name})
            WHERE id = ${alpha.id}
        `);
        await db.execute(sql`
            UPDATE materials
            SET search_vector = to_tsvector('simple', ${beta.name})
            WHERE id = ${beta.id}
        `);

        const result = await MaterialsService.search(testTeamId, 'sand');
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.map(item => item.code)).toEqual(['A-100', 'B-100']);
        }
    });

    it('matches multi-word prefix queries in regular catalog search', async () => {
        await db.insert(materials).values({
            tenantId: testTeamId,
            code: 'P-001',
            name: 'Подвес прямой 60х27',
            status: 'active',
        });

        const result = await MaterialsService.getMany(testTeamId, 50, 'подвес пр');

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.some((row) => row.name === 'Подвес прямой 60х27')).toBe(true);
        }
    });

    it('prioritizes vendor matches over name-only matches', async () => {
        const [vendorMatch] = await db.insert(materials).values({
            tenantId: testTeamId,
            code: 'V-100',
            name: 'Generic Material',
            vendor: 'Acme Brand',
            status: 'active',
        }).returning();

        const [nameMatch] = await db.insert(materials).values({
            tenantId: testTeamId,
            code: 'N-100',
            name: 'Acme Cement',
            status: 'active',
        }).returning();

        await db.execute(sql`
            UPDATE materials
            SET search_vector = to_tsvector('simple', ${vendorMatch.name})
            WHERE id = ${vendorMatch.id}
        `);
        await db.execute(sql`
            UPDATE materials
            SET search_vector = to_tsvector('simple', ${nameMatch.name})
            WHERE id = ${nameMatch.id}
        `);

        const result = await MaterialsService.search(testTeamId, 'acme');
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data[0]?.id).toBe(vendorMatch.id);
        }
    });

    it('uses offset in getMany pagination', async () => {
        await db.insert(materials).values([
            { tenantId: testTeamId, code: 'P-001', name: 'Page 1', status: 'active', sortOrder: 100 },
            { tenantId: testTeamId, code: 'P-002', name: 'Page 2', status: 'active', sortOrder: 200 },
            { tenantId: testTeamId, code: 'P-003', name: 'Page 3', status: 'active', sortOrder: 300 },
        ]);

        const firstPage = await MaterialsService.getMany(testTeamId, 2, undefined, 0);
        const secondPage = await MaterialsService.getMany(testTeamId, 2, undefined, 1);

        expect(firstPage.success).toBe(true);
        expect(secondPage.success).toBe(true);
        if (firstPage.success && secondPage.success) {
            expect(secondPage.data[0]?.id).toBe(firstPage.data[1]?.id);
        }
    });

    it('keeps cursor pagination stable when sort orders are equal by using id tie-breaker', async () => {
        await db.execute(sql`DROP INDEX IF EXISTS idx_materials_code_tenant_unique`);

        try {
            await db.insert(materials).values([
                { tenantId: testTeamId, code: 'DUP-001', name: 'Dup 1', status: 'active', sortOrder: 100 },
                { tenantId: testTeamId, code: 'DUP-001', name: 'Dup 2', status: 'active', sortOrder: 100 },
                { tenantId: testTeamId, code: 'DUP-001', name: 'Dup 3', status: 'active', sortOrder: 100 },
            ]);

            const page1 = await MaterialsService.getMany(testTeamId, 2);
            expect(page1.success).toBe(true);
            if (!page1.success) {
                return;
            }

            const last = page1.data[1];
            expect(last).toBeDefined();
            if (!last) {
                return;
            }

            const page2 = await MaterialsService.getMany(testTeamId, 2, undefined, 0, last.sortOrder, last.id);
            expect(page2.success).toBe(true);

            if (page2.success) {
                const page1Ids = new Set(page1.data.map((item) => item.id));
                expect(page2.data.every((item) => !page1Ids.has(item.id))).toBe(true);
            }
        } finally {
            await db.execute(sql`DELETE FROM materials WHERE tenant_id = ${testTeamId} AND code = 'DUP-001'`);
            await db.execute(sql`
                CREATE UNIQUE INDEX IF NOT EXISTS idx_materials_code_tenant_unique
                ON materials (tenant_id, code)
            `);
        }
    });

    it('returns materials in explicit sort order instead of code order', async () => {
        await db.insert(materials).values([
            { tenantId: testTeamId, code: 'M-300', name: 'Third', status: 'active', sortOrder: 300 },
            { tenantId: testTeamId, code: 'M-100', name: 'First', status: 'active', sortOrder: 100 },
            { tenantId: testTeamId, code: 'M-200', name: 'Second', status: 'active', sortOrder: 200 },
        ]);

        const result = await MaterialsService.getMany(testTeamId, 10);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.map((item) => item.code)).toEqual(['M-100', 'M-200', 'M-300']);
        }
    });
});
