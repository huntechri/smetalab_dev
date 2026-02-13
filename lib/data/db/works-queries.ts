import { and, gt, sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

import { db } from './drizzle';
import { works } from './schema';
import { getTeamForUser } from './user-team-queries';
import { withActiveTenant } from './tenant';
import { WorkRow } from '@/types/work-row';

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

  return (await query) as unknown as WorkRow[];
}

export async function getWorksCount() {
  const team = await getTeamForUser();
  const teamId = team?.id;

  const result = await db.select({ count: sql<number>`count(*)` }).from(works).where(withActiveTenant(works, teamId));

  return Number(result[0].count);
}

export async function getWorksCached() {
  const team = await getTeamForUser();
  const teamId = team?.id;

  return unstable_cache(
    async () => {
      return (await db
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
        .orderBy(works.sortOrder)) as unknown as WorkRow[];
    },
    [`works-team-${teamId || 'public'}`],
    {
      tags: ['works', teamId ? `works-team-${teamId}` : 'works-public'],
      revalidate: 3600,
    }
  )();
}
