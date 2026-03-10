import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { cache } from 'react';
import { cookies } from 'next/headers';

import { db } from './drizzle';
import {
  activityLogs,
  impersonationSessions,
  teamMembers,
  teams,
  users,
  type Team,
  type TeamDataWithMembers,
  type User,
} from './schema';
import {
  getSession,
  REFRESH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  verifyToken,
} from '@/lib/infrastructure/auth/session';
import { refreshSessionTokens } from '@/lib/services/auth-refresh.service';
import { SYSTEM_TENANT_ID } from './tenant';

type SessionData = Awaited<ReturnType<typeof getSession>>;

async function tryRefreshSessionFromCookie(): Promise<SessionData> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return null;
  }

  const refreshResult = await refreshSessionTokens(refreshToken);
  if (!refreshResult.success) {
    return null;
  }

  try {
    cookieStore.set(SESSION_COOKIE_NAME, refreshResult.accessToken, {
      expires: refreshResult.accessExpires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    cookieStore.set(REFRESH_COOKIE_NAME, refreshResult.refreshToken, {
      expires: refreshResult.refreshExpires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  } catch {
    // Some contexts (e.g. RSC) expose read-only cookies; token refresh still works for current request.
  }

  return verifyToken(refreshResult.accessToken);
}

async function getSessionWithRefresh(): Promise<SessionData> {
  const sessionData = await getSession();

  // If access token is missing/invalid/expired at JWT level, fall back to refresh token.
  if (!sessionData || !sessionData.user || typeof sessionData.user.id !== 'number') {
    return tryRefreshSessionFromCookie();
  }

  if (new Date(sessionData.expires) >= new Date()) {
    return sessionData;
  }

  return tryRefreshSessionFromCookie();
}

export const getUser = cache(async () => {
  const sessionData = await getSessionWithRefresh();
  if (!sessionData) {
    return null;
  }

  const user = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
      role: teamMembers.role,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return {
    ...user[0].user,
    tenantId: user[0].teamId,
    teamRole: user[0].role,
  };
});

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs(userId?: number) {
  let targetUserId = userId;

  if (!targetUserId) {
    const user = await getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    targetUserId = user.id;
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, targetUserId))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

const TENANT_ID_COOKIE_KEYS = ['tenant_id', 'team_id'];
type TeamResolutionMode = 'summary' | 'withMembers';

async function getTenantIdFromCookies(): Promise<number | null> {
  const cookieStore = await cookies();
  const rawTenantId = TENANT_ID_COOKIE_KEYS.map((key) => cookieStore.get(key)?.value).find(Boolean);

  if (!rawTenantId) {
    return null;
  }

  const tenantId = Number.parseInt(rawTenantId, 10);
  return Number.isNaN(tenantId) ? null : tenantId;
}

async function getUserTeamIdWithoutRls(userId: number): Promise<number | null> {
  const result = await db.execute(sql`SELECT get_user_team_id(${userId}) AS team_id`);
  const rows = result as unknown as { team_id: number | null }[];
  return rows[0]?.team_id ?? null;
}

async function getImpersonationTeam(
  impersonationToken: string,
  mode: TeamResolutionMode
) {
  if (mode === 'withMembers') {
    const session = await db.query.impersonationSessions.findFirst({
      where: eq(impersonationSessions.sessionToken, impersonationToken),
      with: {
        targetTeam: {
          with: {
            teamMembers: {
              with: {
                user: {
                  columns: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return session?.targetTeam ?? null;
  }

  const session = await db.query.impersonationSessions.findFirst({
    where: eq(impersonationSessions.sessionToken, impersonationToken),
    with: {
      targetTeam: true,
    },
  });

  return session?.targetTeam ?? null;
}

async function getTeamForUserByMode(mode: TeamResolutionMode) {
  const cookieStore = await cookies();
  const impersonationToken = cookieStore.get('impersonation_id')?.value;

  if (impersonationToken) {
    const impersonationTeam = await getImpersonationTeam(impersonationToken, mode);
    if (impersonationTeam) {
      return impersonationTeam;
    }
  }

  const user = await getUser();
  if (!user) {
    return null;
  }

  const tenantId = await getTenantIdFromCookies();
  const team = await resolveTeamForUser(user, tenantId, { mode });
  return team ?? null;
}

export const getTeamForUser = cache(async (): Promise<Team | null> => {
  const team = await getTeamForUserByMode('summary');
  return team as Team | null;
});

export const getTeamForUserWithMembers = cache(async (): Promise<TeamDataWithMembers | null> => {
  const team = await getTeamForUserByMode('withMembers');
  return team as TeamDataWithMembers | null;
});

export async function resolveTeamForUser(
  user: Pick<User, 'id' | 'platformRole'>,
  tenantIdOverride?: number | null,
  options?: { mode?: TeamResolutionMode }
) {
  const mode: TeamResolutionMode = options?.mode ?? 'summary';

  const resolveTeamById = async (
    tx: Pick<typeof db, 'query'> & Pick<typeof db, 'execute'>,
    teamId: number
  ) => {
    if (mode === 'withMembers') {
      const team = await tx.query.teams.findFirst({
        where: eq(teams.id, teamId),
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return team ?? null;
    }

    const team = await tx.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    return team ?? null;
  };

  const resolveMembershipTeam = async (tenantId: number) => {
    return db.transaction(async (tx) => {
      await tx.execute(sql`SELECT set_config('app.tenant_id', ${tenantId.toString()}, true)`);

      const membership = await tx.query.teamMembers.findFirst({
        where: and(eq(teamMembers.userId, user.id), isNull(teamMembers.leftAt)),
        columns: {
          teamId: true,
        },
      });

      if (!membership?.teamId) {
        return null;
      }

      return resolveTeamById(tx, membership.teamId);
    });
  };

  if (user.platformRole === 'superadmin') {
    return db.transaction(async (tx) => {
      await tx.execute(sql`SELECT set_config('app.platform_role', 'superadmin', true)`);

      const membership = await tx.query.teamMembers.findFirst({
        where: and(eq(teamMembers.userId, user.id), isNull(teamMembers.leftAt)),
        columns: {
          teamId: true,
        },
      });

      if (membership?.teamId) {
        const team = await resolveTeamById(tx, membership.teamId);
        if (team) {
          return team;
        }
      }

      return resolveTeamById(tx, SYSTEM_TENANT_ID);
    });
  }

  const tenantId = tenantIdOverride ?? (await getUserTeamIdWithoutRls(user.id));
  if (!tenantId) {
    return null;
  }

  const team = await resolveMembershipTeam(tenantId);
  if (team || !tenantIdOverride) {
    return team;
  }

  const fallbackTenantId = await getUserTeamIdWithoutRls(user.id);
  if (!fallbackTenantId || fallbackTenantId === tenantId) {
    return team;
  }

  const fallbackTeam = await resolveMembershipTeam(fallbackTenantId);
  return fallbackTeam ?? null;
}
