import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db } from '@/lib/data/db/drizzle';
import { materials, users, teams, teamMembers } from '@/lib/data/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getUser, getTeamForUser } from '@/lib/data/db/queries';
import { resetDatabase } from '@/lib/data/db/test-utils';

vi.mock('@/lib/data/db/queries', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as object),
        getUser: vi.fn(),
        getTeamForUser: vi.fn(),
    };
});

describe('Materials search vector trigger', () => {
    let testUserId: number;
    let testTeamId: number;

    const setupUserAndTeam = async () => {
        await resetDatabase();

        const [user] = await db.insert(users).values({
            name: 'Trigger User',
            email: `material-trigger-${Date.now()}@test.com`,
            passwordHash: 'hashed_password',
        }).returning();
        testUserId = user.id;

        const [team] = await db.insert(teams).values({
            name: 'Trigger Team',
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

    it('normalizes name and builds search vector on insert', async () => {
        const [material] = await db.insert(materials).values({
            tenantId: testTeamId,
            code: 'TR-001',
            name: '  Café   Cement  ',
            vendor: 'VendorX',
            tags: ['Heavy', 'Mix'],
            description: 'High strength mix',
            status: 'active',
        }).returning();

        const result = await db.execute(sql`
            SELECT name_norm, search_vector::text AS search_vector
            FROM materials
            WHERE id = ${material.id}
        `);
        const row = (result[0] as { name_norm: string | null; search_vector: string | null }) ?? null;

        expect(row?.name_norm).toBe('cafe cement');
        expect(row?.search_vector).toContain('cafe');
        expect(row?.search_vector).toContain('cement');
        expect(row?.search_vector).toContain('vendorx');
    });

    it('recomputes name_norm and search_vector on update', async () => {
        const [material] = await db.insert(materials).values({
            tenantId: testTeamId,
            code: 'TR-002',
            name: 'Old Name',
            status: 'active',
        }).returning();

        await db.update(materials)
            .set({
                name: '  Updated   Name  ',
                description: 'Fresh mix',
                tags: ['New', 'Batch'],
            })
            .where(eq(materials.id, material.id));

        const result = await db.execute(sql`
            SELECT name_norm, search_vector::text AS search_vector
            FROM materials
            WHERE id = ${material.id}
        `);
        const row = (result[0] as { name_norm: string | null; search_vector: string | null }) ?? null;

        expect(row?.name_norm).toBe('updated name');
        expect(row?.search_vector).toContain('updated');
        expect(row?.search_vector).toContain('name');
        expect(row?.search_vector).toContain('batch');
    });
});
