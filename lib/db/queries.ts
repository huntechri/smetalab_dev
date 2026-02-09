import { desc, and, eq, isNull, or, ilike, AnyColumn, sql, gt } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users, works, materials, counterparties, type User, impersonationSessions } from './schema';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth/session';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';


import { WorkRow } from '@/types/work-row';
import { MaterialRow } from '@/types/material-row';
import { CounterpartyRow } from '@/types/counterparty-row';

export const SYSTEM_TENANT_ID = 1;

/**
 * Центр управления безопасностью данных (Multi-tenancy).
 * Гарантирует, что запрос всегда ограничен текущим арендатором и не включает удаленные записи.
 * Также включает глобальные записи (tenantId = 1).
 */
export function withActiveTenant(table: { tenantId: AnyColumn; deletedAt: AnyColumn }, teamId: number | null | undefined) {
  const filters = [isNull(table.deletedAt)];

  if (typeof teamId === 'number') {
    filters.push(
      or(
        eq(table.tenantId, SYSTEM_TENANT_ID),
        eq(table.tenantId, teamId)
      )!
    );
  } else {
    filters.push(eq(table.tenantId, SYSTEM_TENANT_ID));
  }

  return and(...filters);
}

export const getUser = cache(async () => {
  const sessionData = await getSession();
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
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

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
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
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, targetUserId))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

const TENANT_ID_COOKIE_KEYS = ['tenant_id', 'team_id'];

async function getTenantIdFromCookies(): Promise<number | null> {
  const cookieStore = await cookies();
  const rawTenantId = TENANT_ID_COOKIE_KEYS
    .map((key) => cookieStore.get(key)?.value)
    .find(Boolean);

  if (!rawTenantId) {
    return null;
  }

  const tenantId = Number.parseInt(rawTenantId, 10);
  return Number.isNaN(tenantId) ? null : tenantId;
}

async function getUserTeamIdWithoutRls(userId: number): Promise<number | null> {
  const result = await db.execute(
    sql`SELECT get_user_team_id(${userId}) AS team_id`
  );
  const rows = result as unknown as { team_id: number | null }[];
  return rows[0]?.team_id ?? null;
}

export const getTeamForUser = cache(async () => {
  const cookieStore = await cookies();
  const impersonationToken = cookieStore.get('impersonation_id')?.value;

  if (impersonationToken) {
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
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (session?.targetTeam) {
      return session.targetTeam;
    }
  }

  const user = await getUser();
  if (!user) {
    return null;
  }

  const tenantId = await getTenantIdFromCookies();

  return resolveTeamForUser(user, tenantId);
});

export async function resolveTeamForUser(
  user: Pick<User, 'id' | 'platformRole'>,
  tenantIdOverride?: number | null
) {
  const resolveMembershipTeam = async (tenantId: number) => {
    return db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT set_config('app.tenant_id', ${tenantId.toString()}, true)`
      );

      const membership = await tx.query.teamMembers.findFirst({
        where: eq(teamMembers.userId, user.id),
        with: {
          team: {
            with: {
              teamMembers: {
                with: {
                  user: {
                    columns: {
                      id: true,
                      name: true,
                      email: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      return membership?.team ?? null;
    });
  };

  if (user.platformRole === 'superadmin') {
    return db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT set_config('app.platform_role', 'superadmin', true)`
      );

      const membership = await tx.query.teamMembers.findFirst({
        where: eq(teamMembers.userId, user.id),
        with: {
          team: {
            with: {
              teamMembers: {
                with: {
                  user: {
                    columns: {
                      id: true,
                      name: true,
                      email: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (membership?.team) {
        return membership.team;
      }

      const systemTeam = await tx.query.teams.findFirst({
        where: eq(teams.id, SYSTEM_TENANT_ID),
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return systemTeam ?? null;
    });
  }

  const tenantId = tenantIdOverride ?? await getUserTeamIdWithoutRls(user.id);
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

  return resolveMembershipTeam(fallbackTenantId);
}

export async function getWorks(limit?: number, lastSortOrder?: number) {
  const team = await getTeamForUser();
  const teamId = team?.id;

  const filters = [withActiveTenant(works, teamId)];

  if (typeof lastSortOrder === 'number') {
    filters.push(gt(works.sortOrder, lastSortOrder));
  }

  const query = db
    .select({
      id: works.id,
      tenantId: works.tenantId,
      code: works.code,
      name: works.name,
      unit: works.unit,
      price: works.price,
      phase: works.phase,
      category: works.category,
      subcategory: works.subcategory,
      shortDescription: works.shortDescription,
      description: works.description,
      status: works.status,
      tags: works.tags,
      metadata: works.metadata,
      createdAt: works.createdAt,
      updatedAt: works.updatedAt,
      deletedAt: works.deletedAt,
      sortOrder: works.sortOrder,
    })
    .from(works)
    .where(and(...filters))
    .orderBy(works.sortOrder)
    .limit(limit || 5);

  return await query as unknown as WorkRow[];
}

export async function getWorksCount() {
  const team = await getTeamForUser();
  const teamId = team?.id;

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(works)
    .where(withActiveTenant(works, teamId));

  return Number(result[0].count);
}

export async function getWorksCached() {
  const team = await getTeamForUser();
  const teamId = team?.id;

  return unstable_cache(
    async () => {
      return await db
        .select({
          id: works.id,
          tenantId: works.tenantId,
          code: works.code,
          name: works.name,
          unit: works.unit,
          price: works.price,
          phase: works.phase,
          category: works.category,
          subcategory: works.subcategory,
          shortDescription: works.shortDescription,
          description: works.description,
          status: works.status,
          metadata: works.metadata,
          tags: works.tags,
          createdAt: works.createdAt,
          updatedAt: works.updatedAt,
          deletedAt: works.deletedAt,
          sortOrder: works.sortOrder,
        })
        .from(works)
        .where(withActiveTenant(works, teamId))
        .orderBy(works.sortOrder) as unknown as WorkRow[];
    },
    [`works-team-${teamId || 'public'}`],
    {
      tags: ['works', teamId ? `works-team-${teamId}` : 'works-public'],
      revalidate: 3600,
    }
  )();
}

export async function getMaterials(limit?: number, search?: string, lastCode?: string) {
  const team = await getTeamForUser();
  const teamId = team?.id;

  const filters = [withActiveTenant(materials, teamId)];

  if (search) {
    filters.push(ilike(materials.name, `%${search}%`));
  }

  if (lastCode) {
    filters.push(sql`${materials.code} > ${lastCode}`);
  }

  let query = db
    .select({
      id: materials.id,
      tenantId: materials.tenantId,
      code: materials.code,
      name: materials.name,
      unit: materials.unit,
      price: materials.price,
      vendor: materials.vendor,
      weight: materials.weight,
      categoryLv1: materials.categoryLv1,
      categoryLv2: materials.categoryLv2,
      categoryLv3: materials.categoryLv3,
      categoryLv4: materials.categoryLv4,
      productUrl: materials.productUrl,
      imageUrl: materials.imageUrl,
      imageLocalUrl: materials.imageLocalUrl,
      description: materials.description,
      status: materials.status,
      tags: materials.tags,
      metadata: materials.metadata,
      createdAt: materials.createdAt,
      updatedAt: materials.updatedAt,
      deletedAt: materials.deletedAt,
    })
    .from(materials)
    .where(and(...filters))
    .orderBy(materials.code);

  const finalLimit = limit || (search ? 5 : 5);
  if (finalLimit) {
    // @ts-expect-error - constructing query dynamically
    query = query.limit(finalLimit);
  }

  return await query as unknown as MaterialRow[];
}

export async function getMaterialsCount(search?: string) {
  const team = await getTeamForUser();
  const teamId = team?.id;

  const filters = [withActiveTenant(materials, teamId)];

  if (search) {
    filters.push(ilike(materials.name, `%${search}%`));
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(materials)
    .where(and(...filters));

  return Number(result[0].count);
}

export async function getCounterparties(teamId: number, options: { limit?: number; offset?: number; search?: string } = {}) {
  const { limit = 50, offset = 0, search } = options;

  const filters = [withActiveTenant(counterparties, teamId)];

  if (search) {
    filters.push(ilike(counterparties.name, `%${search}%`));
  }

  const data = await db
    .select()
    .from(counterparties)
    .where(and(...filters))
    .orderBy(desc(counterparties.updatedAt))
    .limit(limit)
    .offset(offset);

  const countQuery = await db
    .select({ count: sql<number>`count(*)` })
    .from(counterparties)
    .where(and(...filters));

  return {
    data: data as unknown as CounterpartyRow[],
    count: Number(countQuery[0].count),
  };
}

export async function getCounterpartiesCount(teamId: number, search?: string) {
  const filters = [withActiveTenant(counterparties, teamId)];

  if (search) {
    filters.push(ilike(counterparties.name, `%${search}%`));
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(counterparties)
    .where(and(...filters));

  return Number(result[0].count);
}
