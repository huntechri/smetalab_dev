import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/lib/db/drizzle';
import { resolveTeamForUser, SYSTEM_TENANT_ID } from '@/lib/db/queries';
import { teamMembers, teams, users } from '@/lib/db/schema';
import { resetDatabase, syncTableSequence } from '@/lib/db/test-utils';

describe('resolveTeamForUser', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('returns the system team for a superadmin without membership', async () => {
    await db.insert(teams).values({ id: SYSTEM_TENANT_ID, name: 'System' });

    const [superadmin] = await db.insert(users).values({
      email: 'superadmin@example.com',
      passwordHash: 'hash',
      platformRole: 'superadmin'
    }).returning();

    const team = await resolveTeamForUser(superadmin);

    expect(team?.id).toBe(SYSTEM_TENANT_ID);
  });

  it('prefers explicit membership over the system team', async () => {
    await db.insert(teams).values({ id: SYSTEM_TENANT_ID, name: 'System' });
    await syncTableSequence('teams');
    const [memberTeam] = await db.insert(teams).values({ name: 'Member Team' }).returning();

    const [superadmin] = await db.insert(users).values({
      email: 'superadmin-with-team@example.com',
      passwordHash: 'hash',
      platformRole: 'superadmin'
    }).returning();

    await db.insert(teamMembers).values({
      userId: superadmin.id,
      teamId: memberTeam.id,
      role: 'admin'
    });

    const team = await resolveTeamForUser(superadmin);

    expect(team?.id).toBe(memberTeam.id);
  });

  it('returns null when a regular user has no team', async () => {
    await db.insert(teams).values({ id: SYSTEM_TENANT_ID, name: 'System' });

    const [user] = await db.insert(users).values({
      email: 'user@example.com',
      passwordHash: 'hash'
    }).returning();

    const team = await resolveTeamForUser(user);

    expect(team).toBeNull();
  });

  it('returns the member team for a regular user with membership', async () => {
    await db.insert(teams).values({ id: SYSTEM_TENANT_ID, name: 'System' });
    await syncTableSequence('teams');
    const [memberTeam] = await db.insert(teams).values({ name: 'Member Team' }).returning();

    const [user] = await db.insert(users).values({
      email: 'member@example.com',
      passwordHash: 'hash'
    }).returning();

    await db.insert(teamMembers).values({
      userId: user.id,
      teamId: memberTeam.id,
      role: 'manager'
    });

    const team = await resolveTeamForUser(user);

    expect(team?.id).toBe(memberTeam.id);
  });

  it('falls back to the membership team when tenant override is stale', async () => {
    await db.insert(teams).values({ id: SYSTEM_TENANT_ID, name: 'System' });
    await syncTableSequence('teams');
    const [memberTeam] = await db.insert(teams).values({ name: 'Member Team' }).returning();
    const [otherTeam] = await db.insert(teams).values({ name: 'Other Team' }).returning();

    const [user] = await db.insert(users).values({
      email: 'member-stale-override@example.com',
      passwordHash: 'hash'
    }).returning();

    await db.insert(teamMembers).values({
      userId: user.id,
      teamId: memberTeam.id,
      role: 'admin'
    });

    const team = await resolveTeamForUser(user, otherTeam.id);

    expect(team?.id).toBe(memberTeam.id);
  });
});
