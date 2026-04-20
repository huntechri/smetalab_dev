import { and, ilike, sql } from 'drizzle-orm';

import { db } from './drizzle';
import { materials } from './schema';
import { getTeamForUser } from './user-team-queries';
import { withActiveTenant } from './tenant';
import { MaterialRow } from '@/shared/types/domain/material-row';

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

  return (await query) as unknown as MaterialRow[];
}

export async function getMaterialsCount(search?: string) {
  const team = await getTeamForUser();
  const teamId = team?.id;

  const filters = [withActiveTenant(materials, teamId)];

  if (search) {
    filters.push(ilike(materials.name, `%${search}%`));
  }

  const result = await db.select({ count: sql<number>`count(*)` }).from(materials).where(and(...filters));

  return Number(result[0].count);
}
