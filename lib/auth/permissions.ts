/**
 * Granular RBAC permission helpers.
 *
 * Works alongside the existing `lib/infrastructure/auth/rbac.ts` (server-side
 * `hasPermission` / `getUserPermissions`) and `lib/infrastructure/auth/access.ts`
 * (request-level `checkAccess` / `requirePermission`).
 *
 * This module adds convenience shortcuts for domain-specific permission checks.
 */

import { db } from '@/lib/data/db/drizzle';
import {
  permissions,
  rolePermissions,
  teamMembers,
  users as usersTable,
} from '@/lib/data/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { cache } from 'react';
import { getSession } from '@/lib/infrastructure/auth/session';

// ─── Permission key type ────────────────────────────────────────────────

/** All recognised permission codes in the system. */
export type PermissionKey =
  | 'projects'
  | 'team'
  | 'guide'
  | 'settings'
  | 'platform.tenants'
  | 'platform.permissions'
  | 'platform.activity';

// ─── Core ───────────────────────────────────────────────────────────────

/**
 * Fetch all permission codes the current user has (tenant-scoped).
 * Reads the session cookie, resolves team membership, and returns the
 * permission codes granted by the user's tenant role.
 */
export const getUserPermissions = cache(async (): Promise<PermissionKey[]> => {
  const session = await getSession();
  if (!session) return [];

  const now = new Date();
  if (session.expires && new Date(session.expires) < now) return [];

  const [member] = await db
    .select({ role: teamMembers.role })
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.userId, session.user.id),
        isNull(teamMembers.leftAt),
      ),
    )
    .limit(1);

  if (!member) return [];

  const rows = await db
    .select({ key: permissions.code })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.role, member.role));

  return rows.map((r) => r.key as PermissionKey);
});

/**
 * Check whether the current user possesses a specific permission.
 */
export const hasPermission = cache(
  async (key: PermissionKey): Promise<boolean> => {
    const perms = await getUserPermissions();
    return perms.includes(key);
  },
);

/**
 * Check whether the current user has *any* of the supplied permissions.
 */
export async function hasAnyPermission(
  keys: PermissionKey[],
): Promise<boolean> {
  const perms = await getUserPermissions();
  return keys.some((k) => perms.includes(k));
}

/**
 * Check whether the current user has *all* supplied permissions.
 */
export async function hasAllPermissions(
  keys: PermissionKey[],
): Promise<boolean> {
  const perms = await getUserPermissions();
  return keys.every((k) => perms.includes(k));
}

// ─── Domain shortcuts ────────────────────────────────────────────────────

export async function canManageProjects(): Promise<boolean> {
  return hasPermission('projects');
}

export async function canManageEstimates(): Promise<boolean> {
  return hasPermission('projects');
}

export async function canManagePurchases(): Promise<boolean> {
  return hasPermission('projects');
}

export async function canManageTeam(): Promise<boolean> {
  return hasPermission('team');
}

export async function canManageDirectories(): Promise<boolean> {
  return hasPermission('guide');
}

export async function canViewBilling(): Promise<boolean> {
  return hasPermission('settings');
}

// ─── Enforcement ─────────────────────────────────────────────────────────

/**
 * Require a specific permission or throw.
 * Returns the session user id for downstream use.
 */
export async function requirePermission(
  key: PermissionKey,
): Promise<{ userId: number }> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized: No active session');
  }

  const permitted = await hasPermission(key);
  if (!permitted) {
    throw new Error(`Forbidden: Missing permission "${key}"`);
  }

  return { userId: session.user.id };
}

/**
 * Require an active session (no permission check).
 * Returns the session user id.
 */
export async function requireAuth(): Promise<{ userId: number }> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized: No active session');
  }
  return { userId: session.user.id };
}

/**
 * Get all users with their team roles for the team management screen.
 * Requires 'team' permission.
 */
export async function getTeamMembersWithRoles(): Promise<
  Array<{
    userId: number;
    name: string;
    email: string;
    role: string;
    joinedAt: Date;
  }>
> {
  await requirePermission('team');

  const rows = await db
    .select({
      userId: teamMembers.userId,
      name: usersTable.name,
      email: usersTable.email,
      role: teamMembers.role,
      joinedAt: teamMembers.joinedAt,
    })
    .from(teamMembers)
    .innerJoin(usersTable, eq(teamMembers.userId, usersTable.id))
    .where(isNull(teamMembers.leftAt))
    .orderBy(teamMembers.joinedAt);

  return rows.map((r) => ({
    userId: r.userId,
    name: r.name,
    email: r.email,
    role: r.role,
    joinedAt: r.joinedAt,
  }));
}
