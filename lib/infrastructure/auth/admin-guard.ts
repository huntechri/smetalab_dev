import type { User } from '@/lib/data/db/schema';

type UserLike = Pick<User, 'platformRole'> | null | undefined;

/**
 * Platform admin roles allowed to access admin dashboards and queries.
 */
export function isPlatformAdminRole(role: User['platformRole'] | null | undefined): boolean {
  return role === 'superadmin' || role === 'support';
}

/**
 * Runtime guard for platform admin access checks.
 */
export function assertPlatformAdminAccess(user: UserLike): void {
  if (!user || !isPlatformAdminRole(user.platformRole)) {
    throw new Error('Forbidden: platform admin access required');
  }
}

