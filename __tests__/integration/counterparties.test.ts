
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { db } from '@/lib/data/db/drizzle';
import { counterparties, users, teams, teamMembers, activityLogs } from '@/lib/data/db/schema';
import { createCounterparty, updateCounterparty, deleteCounterparty } from '@/app/actions/counterparties/crud';
import { eq, and } from 'drizzle-orm';
import { getUser, getTeamForUser } from '@/lib/data/db/queries';
import { resetDatabase } from '@/lib/data/db/test-utils';

// --- Mocks ---
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
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

describe('Counterparties Integration Tests', () => {
    let testUserId: number;
    let testTeamId: number;

    beforeEach(async () => {
        await resetDatabase();

        const [user] = await db.insert(users).values({
            name: 'Counterparty User',
            email: `cp-test-${Date.now()}@test.com`,
            passwordHash: 'hash',
        }).returning();
        testUserId = user.id;

        const [team] = await db.insert(teams).values({
            name: 'CP Team'
        }).returning();
        testTeamId = team.id;

        await db.insert(teamMembers).values({ userId: testUserId, teamId: testTeamId, role: 'admin' });

        vi.mocked(getUser).mockResolvedValue({ ...user, tenantId: testTeamId, teamRole: 'admin' } as MockedUser);
        vi.mocked(getTeamForUser).mockResolvedValue(team as MockedTeam);
    });

    afterEach(async () => {
        vi.resetAllMocks();
    });

    it('should_create_individual_counterparty_when_data_is_valid', async () => {
        const data = {
            name: 'Иван Иванов',
            type: 'customer' as const,
            legalStatus: 'individual' as const,
            birthDate: '1990-01-01',
            passportSeriesNumber: '1234 567890',
            phone: '+79998887766',
            email: 'ivan@test.com',
        };

        const result = await createCounterparty(data);

        expect(result.success).toBe(true);
        const inDb = await db.select().from(counterparties).where(and(eq(counterparties.name, 'Иван Иванов'), eq(counterparties.tenantId, testTeamId)));
        expect(inDb).toHaveLength(1);
        expect(inDb[0].type).toBe('customer');
        expect(inDb[0].legalStatus).toBe('individual');
        expect(inDb[0].email).toBe('ivan@test.com');

        // Verify activity log
        const logs = await db.select().from(activityLogs).where(eq(activityLogs.teamId, testTeamId));
        expect(logs.some(l => l.action.includes('Created counterparty: Иван Иванов'))).toBe(true);
    });

    it('should_create_company_counterparty_with_inn_kpp', async () => {
        const data = {
            name: 'ООО Ромашка',
            type: 'supplier' as const,
            legalStatus: 'company' as const,
            inn: '7700123456',
            kpp: '770001001',
            ogrn: '1234567890123',
            address: 'Москва, ул. Ленина, 1',
        };

        const result = await createCounterparty(data);

        expect(result.success).toBe(true);
        const [company] = await db.select().from(counterparties).where(eq(counterparties.inn, '7700123456'));
        expect(company.name).toBe('ООО Ромашка');
        expect(company.legalStatus).toBe('company');
    });

    it('should_update_counterparty_successfully', async () => {
        const [cp] = await db.insert(counterparties).values({
            tenantId: testTeamId,
            name: 'Original Name',
            type: 'contractor',
            legalStatus: 'company',
            inn: '11111111',
        }).returning();

        const result = await updateCounterparty({ id: cp.id, data: { name: 'Updated Name', type: 'customer', legalStatus: 'company' } });

        expect(result.success).toBe(true);
        const [updated] = await db.select().from(counterparties).where(eq(counterparties.id, cp.id));
        expect(updated.name).toBe('Updated Name');
        expect(updated.type).toBe('customer');
    });

    it('should_soft_delete_counterparty_successfully', async () => {
        const [cp] = await db.insert(counterparties).values({
            tenantId: testTeamId,
            name: 'To Delete',
            type: 'customer',
            legalStatus: 'individual',
        }).returning();

        const result = await deleteCounterparty(cp.id);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.id).toBe(cp.id);
            expect(result.data.deletedAt).not.toBeNull();
        }

        const [inDb] = await db.select().from(counterparties).where(eq(counterparties.id, cp.id));
        expect(inDb.deletedAt).not.toBeNull();
    });

    it('should_fail_to_create_duplicate_company_in_same_tenant', async () => {
        const data = {
            name: 'Unique Co',
            type: 'customer' as const,
            legalStatus: 'company' as const,
            inn: '9999999999',
            kpp: '123456789',
        };

        await createCounterparty(data);

        // This should fail due to unique constraint in schema
        const result = await createCounterparty(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.code).toBe('DUPLICATE_RECORD');
        }
    });

    // SKIPPED: safeAction uses db.query.teamMembers.findFirst which bypasses mocks.
    // Full multi-tenancy isolation should be tested in e2e tests with real context switching.
    it.skip('should_allow_same_inn_in_different_tenants', async () => {
        // Create in first tenant
        const data = {
            name: 'Global Co',
            type: 'customer' as const,
            legalStatus: 'company' as const,
            inn: '7777777777',
            kpp: '111',
        };
        await createCounterparty(data);

        // Setup second tenant
        const [team2] = await db.insert(teams).values({ name: 'Team 2' }).returning();
        await db.insert(teamMembers).values({ userId: testUserId, teamId: team2.id, role: 'admin' });
        const user = await db.query.users.findFirst({ where: eq(users.id, testUserId) });
        vi.mocked(getUser).mockResolvedValue({ ...user, tenantId: team2.id, teamRole: 'admin' } as MockedUser);
        vi.mocked(getTeamForUser).mockResolvedValue(team2 as MockedTeam);

        // Should succeed in second tenant
        const result = await createCounterparty({ ...data, name: 'Global Co Branch' });
        expect(result.success).toBe(true);
    });

    it('should_fail_when_unauthorized', async () => {
        vi.mocked(getUser).mockResolvedValue(null);
        const result = await createCounterparty({ name: 'Secret', type: 'customer', legalStatus: 'individual' });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.code).toBe('UNAUTHORIZED');
        }
    });
});
