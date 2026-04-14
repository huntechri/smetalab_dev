import { beforeEach, describe, expect, it } from 'vitest';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/data/db/drizzle';
import { estimateRows, estimates, projects, teams } from '@/lib/data/db/schema';
import { resetDatabase } from '@/lib/data/db/test-utils';
import { EstimateRowsService } from '@/lib/services/estimate-rows.service';

describe('EstimateRowsService large estimate integration', () => {
  let teamId: number;
  let estimateId: string;

  beforeEach(async () => {
    await resetDatabase();

    const [team] = await db.insert(teams).values({ name: 'Load Team' }).returning();
    teamId = team.id;

    const [project] = await db
      .insert(projects)
      .values({ tenantId: teamId, name: 'Large Project', slug: 'large-project' })
      .returning();

    const [estimate] = await db
      .insert(estimates)
      .values({ tenantId: teamId, projectId: project.id, name: 'Large Estimate', slug: 'large-estimate', total: 0 })
      .returning();
    estimateId = estimate.id;

    const works = Array.from({ length: 400 }).map((_, index) => ({
      tenantId: teamId,
      estimateId,
      kind: 'work' as const,
      parentWorkId: null,
      code: String(index + 1),
      name: `Work ${index + 1}`,
      unit: 'шт',
      qty: 1,
      price: 10,
      sum: 10,
      expense: 0,
      order: (index + 1) * 100,
    }));

    const insertedWorks = await db
      .insert(estimateRows)
      .values(works)
      .returning({ id: estimateRows.id, code: estimateRows.code, order: estimateRows.order });

    const materials = insertedWorks.flatMap((work) => [
      {
        tenantId: teamId,
        estimateId,
        kind: 'material' as const,
        parentWorkId: work.id,
        code: `${work.code}.1`,
        name: `Material ${work.code}.1`,
        unit: 'шт',
        qty: 1,
        price: 5,
        sum: 5,
        expense: 0,
        order: work.order + 1,
      },
      {
        tenantId: teamId,
        estimateId,
        kind: 'material' as const,
        parentWorkId: work.id,
        code: `${work.code}.2`,
        name: `Material ${work.code}.2`,
        unit: 'шт',
        qty: 1,
        price: 5,
        sum: 5,
        expense: 0,
        order: work.order + 2,
      },
    ]);

    await db.insert(estimateRows).values(materials);

    await db.update(estimates).set({ total: 400 * 20 }).where(eq(estimates.id, estimateId));
  });

  it('inserts and removes rows within large estimate using bounded renumber and incremental total', async () => {
    const operationBudgetMs = process.env.CI === 'true' ? 10000 : 5000;
    const [{ id: anchorWorkId }] = await db
      .select({ id: estimateRows.id })
      .from(estimateRows)
      .where(and(eq(estimateRows.estimateId, estimateId), eq(estimateRows.code, '200'), isNull(estimateRows.deletedAt)));

    const insertStartedAt = Date.now();
    const addResult = await EstimateRowsService.addWork(teamId, estimateId, {
      name: 'Inserted work',
      unit: 'шт',
      qty: 2,
      price: 10,
      expense: 0,
      insertAfterWorkId: anchorWorkId,
    });
    const insertDurationMs = Date.now() - insertStartedAt;

    expect(addResult.success).toBe(true);
    if (!addResult.success) {
      return;
    }

    expect(insertDurationMs).toBeLessThan(operationBudgetMs);
    expect(addResult.data.code).toBe('201');

    const shiftedWork = await db.query.estimateRows.findFirst({
      where: and(eq(estimateRows.estimateId, estimateId), eq(estimateRows.name, 'Work 201'), isNull(estimateRows.deletedAt)),
    });

    const shiftedMaterial = await db.query.estimateRows.findFirst({
      where: and(eq(estimateRows.estimateId, estimateId), eq(estimateRows.name, 'Material 201.1'), isNull(estimateRows.deletedAt)),
    });

    const [estimateAfterInsert] = await db
      .select({ total: estimates.total })
      .from(estimates)
      .where(eq(estimates.id, estimateId));

    expect(shiftedWork?.code).toBe('202');
    expect(shiftedMaterial?.code).toBe('202.1');
    expect(estimateAfterInsert.total).toBe(8020);

    const removeStartedAt = Date.now();
    const removeResult = await EstimateRowsService.remove(teamId, estimateId, addResult.data.id);
    const removeDurationMs = Date.now() - removeStartedAt;

    expect(removeResult.success).toBe(true);
    expect(removeDurationMs).toBeLessThan(operationBudgetMs);

    const restoredWork = await db.query.estimateRows.findFirst({
      where: and(eq(estimateRows.estimateId, estimateId), eq(estimateRows.name, 'Work 201'), isNull(estimateRows.deletedAt)),
    });

    const [estimateAfterRemove] = await db
      .select({ total: estimates.total })
      .from(estimates)
      .where(eq(estimates.id, estimateId));

    expect(restoredWork?.code).toBe('201');
    expect(estimateAfterRemove.total).toBe(8000);
  });
});
