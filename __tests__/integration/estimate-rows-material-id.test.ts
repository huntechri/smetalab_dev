import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/lib/data/db/drizzle';
import { estimateRows, estimates, materials, projects, teams } from '@/lib/data/db/schema';
import { resetDatabase } from '@/lib/data/db/test-utils';
import { EstimateRowsService } from '@/lib/services/estimate-rows.service';
import { and, eq, isNull } from 'drizzle-orm';

describe('EstimateRowsService materialId integration', () => {
  let teamId: number;
  let estimateId: string;
  let parentWorkId: string;
  let materialId: string;

  beforeEach(async () => {
    await resetDatabase();

    const [team] = await db.insert(teams).values({ name: 'Team A' }).returning();
    teamId = team.id;

    const [project] = await db.insert(projects).values({ tenantId: teamId, name: 'Project A', slug: 'project-a' }).returning();

    const [estimate] = await db.insert(estimates).values({ tenantId: teamId, projectId: project.id, name: 'Estimate A', slug: 'estimate-a' }).returning();
    estimateId = estimate.id;

    const [material] = await db.insert(materials).values({
      tenantId: teamId,
      code: 'MAT-001',
      name: 'Цемент М500',
      nameNorm: 'цемент м500',
      unit: 'меш',
      price: 420,
      status: 'active',
    }).returning();
    materialId = material.id;

    const [work] = await db.insert(estimateRows).values({
      tenantId: teamId,
      estimateId,
      kind: 'work',
      code: '1',
      name: 'Черновые работы',
      unit: 'этап',
      qty: 1,
      price: 0,
      sum: 0,
      expense: 0,
      order: 100,
    }).returning();

    parentWorkId = work.id;
  });

  it('persists materialId when adding estimate material from catalog', async () => {
    const result = await EstimateRowsService.addMaterial(teamId, estimateId, parentWorkId, {
      name: 'Цемент М500',
      materialId,
      unit: 'меш',
      qty: 2,
      price: 420,
      expense: 0,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const [saved] = await db
      .select({ materialId: estimateRows.materialId })
      .from(estimateRows)
      .where(and(eq(estimateRows.id, result.data.id), isNull(estimateRows.deletedAt)));

    expect(saved.materialId).toBe(materialId);
  });
});
