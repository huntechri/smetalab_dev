
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers, invitations, permissions, rolePermissions } from '@/lib/db/schema';
import { inviteTeamMember, removeTeamMember } from '@/app/(login)/actions';
import { eq } from 'drizzle-orm';
import * as emailUtils from '@/lib/email/email';
import * as queryUtils from '@/lib/db/queries';
import { resetDatabase } from '@/lib/db/test-utils';

// Mock auth middleware and dependencies
vi.mock('@/lib/auth/middleware', () => ({
    validatedAction: (schema: unknown, handler: (data: unknown, formData: FormData) => Promise<unknown>) => {
        return async (data: unknown, formData: FormData) => {
            return handler(data, formData);
        };
    },
    validatedActionWithUser: (schema: unknown, handler: (data: unknown, formData: FormData, user: unknown) => Promise<unknown>) => {
        return async (data: unknown, formData: FormData) => {
            const user = await queryUtils.getUser();
            return handler(data, formData, user);
        };
    }
}));

vi.mock('@/lib/db/queries', () => ({
    getUser: vi.fn(),
    getUserWithTeam: vi.fn(),
}));

vi.mock('@/lib/email/email', () => ({
    sendInvitationEmail: vi.fn(),
}));

describe('Team Management Integration', () => {
    let ownerId: number;
    let teamId: number;
    let testEmail: string;

    beforeEach(async () => {
        // Global cleanup before each test to ensure isolation in CI
        await resetDatabase();

        const uniqueId = Date.now() + Math.random();
        testEmail = `new-member-${uniqueId}@example.com`;

        // 0. Setup Permissions (required for actions)
        const [perm] = await db.insert(permissions).values({
            code: 'team',
            name: 'Team Management',
            scope: 'tenant'
        }).returning();

        await db.insert(rolePermissions).values({
            role: 'admin',
            permissionId: perm.id,
            accessLevel: 'manage'
        });

        // 1. Create Owner and Team
        const [owner] = await db.insert(users).values({
            email: `owner-${uniqueId}@example.com`,
            passwordHash: 'hash',
        }).returning();
        ownerId = owner.id;

        const [team] = await db.insert(teams).values({ name: 'Test Team' }).returning();
        teamId = team.id;

        if (!teamId || !ownerId) throw new Error('Failed to setup test data');

        await db.insert(teamMembers).values({
            userId: ownerId,
            teamId: teamId,
            role: 'admin'
        });

        // 2. Setup Mocks
        vi.mocked(queryUtils.getUser).mockResolvedValue(owner as unknown as Awaited<ReturnType<typeof queryUtils.getUser>>);
        vi.mocked(queryUtils.getUserWithTeam).mockResolvedValue({
            user: owner,
            teamId: teamId
        } as unknown as Awaited<ReturnType<typeof queryUtils.getUserWithTeam>>);
        vi.mocked(emailUtils.sendInvitationEmail).mockResolvedValue({ success: true });
    });

    afterEach(async () => {
        await resetDatabase();
        vi.resetAllMocks();
    });

    it('should successfully invite a new member', async () => {
        const result = await inviteTeamMember({ email: testEmail, role: 'estimator' }, new FormData()) as { success?: string; error?: string };

        expect(result).toHaveProperty('success');
        expect(result.success).toMatch(/Приглашение отправлено/);

        // Verify invitation in DB
        const [invitation] = await db.select().from(invitations).where(eq(invitations.email, testEmail));
        expect(invitation).toBeDefined();
        expect(invitation.role).toBe('estimator');
        expect(invitation.status).toBe('pending');

        // Verify email was "sent"
        expect(emailUtils.sendInvitationEmail).toHaveBeenCalled();
    });

    it('should prevent inviting existing members', async () => {
        // Create user first
        const [existingUser] = await db.insert(users).values({
            email: testEmail,
            passwordHash: 'hash'
        }).returning();

        // Add to team
        await db.insert(teamMembers).values({
            userId: existingUser.id,
            teamId: teamId,
            role: 'manager'
        });

        const result = await inviteTeamMember({ email: testEmail, role: 'estimator' }, new FormData());
        expect(result).toHaveProperty('error');
        expect(result.error).toMatch(/already a member/i);
    });

    it('should successfully remove a team member', async () => {
        // 1. Add a member to remove
        const [memberUser] = await db.insert(users).values({
            email: testEmail,
            passwordHash: 'hash'
        }).returning();

        const [memberEntry] = await db.insert(teamMembers).values({
            userId: memberUser.id,
            teamId: teamId,
            role: 'estimator'
        }).returning();

        // 2. Remove member
        const result = await removeTeamMember({ memberId: memberEntry.id }, new FormData());

        expect(result).toHaveProperty('success');

        // 3. Verify member has leftAt set (soft delete)
        const [memberInDb] = await db.select().from(teamMembers).where(eq(teamMembers.id, memberEntry.id));
        expect(memberInDb).toBeDefined();
        expect(memberInDb.leftAt).not.toBeNull();
    });
});
