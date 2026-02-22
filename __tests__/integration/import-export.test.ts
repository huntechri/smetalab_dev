
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '@/lib/data/db/drizzle';
import { materials, works, users, teams, teamMembers } from '@/lib/data/db/schema';
import { importMaterials } from '@/app/actions/materials/import-export';
import { importWorks } from '@/app/actions/works/import-export';
import { exportMaterials } from '@/app/actions/materials/import-export';
import { exportWorks } from '@/app/actions/works/import-export';
import { and, eq } from 'drizzle-orm';
import { getUser, getTeamForUser } from '@/lib/data/db/queries';
import { resetDatabase } from '@/lib/data/db/test-utils';
import { ExcelService } from '@/lib/services/excel.service';
// No changes here, just for context

// ---------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

export let afterPromises: Promise<unknown>[] = [];

vi.mock('next/server', () => ({
    after: vi.fn((cb) => {
        const p = cb();
        afterPromises.push(p);
    }),
}));

vi.mock('@/lib/ai/embeddings', () => ({
    generateEmbedding: vi.fn().mockResolvedValue(new Array(1536).fill(0.1)),
    generateEmbeddingsBatch: vi.fn().mockResolvedValue([new Array(1536).fill(0.1)]),
}));

vi.mock('@/lib/data/db/queries', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as object),
        getUser: vi.fn(),
        getTeamForUser: vi.fn(),
    };
});

// ---------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------

describe('Import/Export Integration Tests', () => {
    let testUserId: number;
    let testTeamId: number;

    const asGetUserResult = <T,>(value: T): Awaited<ReturnType<typeof getUser>> => {
        return value as unknown as Awaited<ReturnType<typeof getUser>>;
    };

    const setupUserAndTeam = async () => {
        await resetDatabase();

        const [user] = await db.insert(users).values({
            name: 'Test Import User',
            email: `import-test-${Date.now()}@test.com`,
            passwordHash: 'hashed_password',
        }).returning();
        testUserId = user.id;

        const [team] = await db.insert(teams).values({
            name: 'Import Test Team'
        }).returning();
        testTeamId = team.id;

        await db.insert(teamMembers).values({
            userId: testUserId,
            teamId: testTeamId,
            role: 'admin',
        });

        vi.mocked(getUser).mockResolvedValue(asGetUserResult({ ...user, tenantId: testTeamId, teamRole: 'admin' }));
        vi.mocked(getTeamForUser).mockResolvedValue(team as unknown as Awaited<ReturnType<typeof getTeamForUser>>);

        return { user, team };
    };

    beforeEach(async () => {
        await setupUserAndTeam();
    });

    describe('Works Import', () => {
        it('should import works and report summary correctly', async () => {
            const data = [
                { 'Код': 'W001', 'Наименование': 'Work 1', 'Ед.изм.': 'm2', 'Цена': 100 },
                { 'Код': 'W002', 'Наименование': 'Work 2', 'Ед.изм.': 'm2', 'Цена': 200 }, // Full data
                { 'Код': '', 'Наименование': 'Invalid' }, // Missing required code
            ];

            const buffer = ExcelService.generateBuffer(data);
            const formData = new FormData();
            const file = new File([new Uint8Array(buffer)], 'works.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            // Polyfill arrayBuffer if not present (jsdom might miss it)
            if (!file.arrayBuffer) {
                file.arrayBuffer = async () => new Uint8Array(buffer).buffer;
            }
            formData.append('file', file);

            const result = await importWorks(formData);

            expect(result.success).toBe(true);
            expect(result.message).toContain('Успешно: 2');
            expect(result.message).toContain('Пропущено: 1');

            const dbWorks = await db.select().from(works).where(eq(works.tenantId, testTeamId));
            expect(dbWorks.length).toBe(2);
            expect(dbWorks.some(w => w.name === 'Work 1')).toBe(true);
            expect(dbWorks.some(w => w.name === 'Work 2')).toBe(true);
        });

        it('should trigger embedding generation after import', async () => {
            const data = [
                { 'Код': 'W001', 'Наименование': 'Work 1', 'Ед.изм.': 'm2', 'Цена': 100 },
            ];

            const buffer = ExcelService.generateBuffer(data);
            const formData = new FormData();
            const file = new File([new Uint8Array(buffer)], 'works.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            if (!file.arrayBuffer) {
                file.arrayBuffer = async () => new Uint8Array(buffer).buffer;
            }
            formData.append('file', file);

            await importWorks(formData);

            // Wait for all background tasks (after callbacks) to complete
            await Promise.all(afterPromises);
            afterPromises.length = 0; // Clear for next tests

            const dbWorks = await db.select().from(works).where(and(eq(works.tenantId, testTeamId), eq(works.code, 'W001')));
            expect(dbWorks[0].embedding).not.toBeNull();
        });
    });

    describe('Works Export', () => {
        it('exports only active rows in tenant scope via withActiveTenant', async () => {
            const [otherTeam] = await db.insert(teams).values({ name: 'Other Team' }).returning();

            await db.insert(works).values([
                {
                    tenantId: testTeamId,
                    code: 'W-T1',
                    name: 'Tenant Active',
                    status: 'active',
                },
                {
                    tenantId: 1,
                    code: 'W-SYS',
                    name: 'System Active',
                    status: 'active',
                },
                {
                    tenantId: testTeamId,
                    code: 'W-DEL',
                    name: 'Tenant Deleted',
                    status: 'active',
                    deletedAt: new Date(),
                },
                {
                    tenantId: otherTeam.id,
                    code: 'W-OTHER',
                    name: 'Other Team Active',
                    status: 'active',
                },
            ]);

            const result = await exportWorks();

            expect(result.success).toBe(true);
            const rows = result.data ?? [];
            const codes = rows.map((row) => row.code);

            expect(codes).toContain('W-T1');
            expect(codes).toContain('W-SYS');
            expect(codes).not.toContain('W-DEL');
            expect(codes).not.toContain('W-OTHER');
        });
    });

    describe('Materials Import', () => {
        it('should import materials and report summary correctly', async () => {
            const data = [
                { 'Код': 'M001', 'Наименование': 'Material 1', 'Ед.изм.': 'kg', 'Цена': 50 },
                { 'Код': 'M002' }, // Missing name (required)
            ];

            const buffer = ExcelService.generateBuffer(data);
            const formData = new FormData();
            const file = new File([new Uint8Array(buffer)], 'materials.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            if (!file.arrayBuffer) {
                file.arrayBuffer = async () => new Uint8Array(buffer).buffer;
            }
            formData.append('file', file);

            const result = await importMaterials(formData);

            expect(result.success).toBe(true);
            expect(result.message).toContain('Успешно: 1');
            expect(result.message).toContain('Пропущено: 1');

            const dbMaterials = await db.select().from(materials).where(eq(materials.tenantId, testTeamId));
            expect(dbMaterials.length).toBe(1);
            expect(dbMaterials[0].name).toBe('Material 1');
        });
    });

    describe('Materials Export', () => {
        it('exports only active rows in tenant scope via withActiveTenant', async () => {
            const [otherTeam] = await db.insert(teams).values({ name: 'Other Team 2' }).returning();

            await db.insert(materials).values([
                {
                    tenantId: testTeamId,
                    code: 'M-T1',
                    name: 'Tenant Material',
                    status: 'active',
                },
                {
                    tenantId: 1,
                    code: 'M-SYS',
                    name: 'System Material',
                    status: 'active',
                },
                {
                    tenantId: testTeamId,
                    code: 'M-DEL',
                    name: 'Deleted Material',
                    status: 'active',
                    deletedAt: new Date(),
                },
                {
                    tenantId: otherTeam.id,
                    code: 'M-OTHER',
                    name: 'Other Team Material',
                    status: 'active',
                },
            ]);

            const result = await exportMaterials();

            expect(result.success).toBe(true);
            const rows = result.data ?? [];
            const codes = rows.map((row) => row['Код']);

            expect(codes).toContain('M-T1');
            expect(codes).toContain('M-SYS');
            expect(codes).not.toContain('M-DEL');
            expect(codes).not.toContain('M-OTHER');
        });
    });
});
