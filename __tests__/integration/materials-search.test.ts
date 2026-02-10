import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { db } from '@/lib/data/db/drizzle';
import { materials, users, teams, teamMembers } from '@/lib/data/db/schema';
import { MaterialsService } from '@/lib/domain/materials/materials.service';
import { generateEmbedding } from '@/lib/ai/embeddings';
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

        vi.mocked(getUser).mockResolvedValue({ ...user, tenantId: testTeamId, teamRole: 'admin' } as any);
        vi.mocked(getTeamForUser).mockResolvedValue(team as unknown as Awaited<ReturnType<typeof getTeamForUser>>);
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
        await setupUserAndTeam();
    });

    afterEach(async () => {
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

    it('skips embedding generation for queries with two tokens or fewer', async () => {
        const generateEmbeddingMock = vi.mocked(generateEmbedding);
        generateEmbeddingMock.mockClear();

        const result = await MaterialsService.search(testTeamId, 'red brick');

        expect(result.success).toBe(true);
        expect(generateEmbeddingMock).not.toHaveBeenCalled();
    });

    it('uses embeddings for queries with three tokens or more', async () => {
        const generateEmbeddingMock = vi.mocked(generateEmbedding);
        generateEmbeddingMock.mockClear();
        generateEmbeddingMock.mockResolvedValue(new Array(1536).fill(0.01));

        const result = await MaterialsService.search(testTeamId, 'red brick wall');

        expect(result.success).toBe(true);
        expect(generateEmbeddingMock).toHaveBeenCalledTimes(1);
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
});
