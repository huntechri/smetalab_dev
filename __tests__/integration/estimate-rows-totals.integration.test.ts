import { beforeEach, describe, expect, it } from 'vitest';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/data/db/drizzle';
import { estimateRows, estimates, projects, teams } from '@/lib/data/db/schema';
import { resetDatabase } from '@/lib/data/db/test-utils';
import { EstimateRowsMaintenance, EstimateRowsService } from '@/lib/services/estimate-rows.service';

const getEstimateTotal = async (estimateId: string) => {
  const [row] = await db.select({ total: estimates.total }).from(estimates).where(eq(estimates.id, estimateId));
  return row.total;
};

describe('EstimateRowsService totals integration', () => {
  let teamId: number;
  let estimateId: string;
  let baseWorkId: string;

  beforeEach(async () => {
    await resetDatabase();

    const [team] = await db.insert(teams).values({ name: 'Totals Team' }).returning();
    teamId = team.id;

    const [project] = await db
      .insert(projects)
      .values({ tenantId: teamId, name: 'Totals Project', slug: 'totals-project' })
      .returning();

    const [estimate] = await db
      .insert(estimates)
      .values({
        tenantId: teamId,
        projectId: project.id,
        name: 'Totals Estimate',
        slug: 'totals-estimate',
        total: 120,
        coefPercent: 20,
      })
      .returning();
    estimateId = estimate.id;

    const [work] = await db
      .insert(estimateRows)
      .values({
        tenantId: teamId,
        estimateId,
        kind: 'work',
        code: '1',
        name: 'Base work',
        unit: 'шт',
        qty: 1,
        price: 100,
        sum: 100,
        expense: 0,
        order: 100,
      })
      .returning();
    baseWorkId = work.id;
  });

  it('updates total by delta when adding work', async () => {
    const result = await EstimateRowsService.addWork(teamId, estimateId, {
      name: 'Second work',
      unit: 'шт',
      qty: 2,
      price: 50,
    });

    expect(result.success).toBe(true);
    expect(await getEstimateTotal(estimateId)).toBe(240);
  });

  it('updates total by delta when adding material', async () => {
    const result = await EstimateRowsService.addMaterial(teamId, estimateId, baseWorkId, {
      name: 'Base material',
      unit: 'шт',
      qty: 2,
      price: 10,
    });

    expect(result.success).toBe(true);
    expect(await getEstimateTotal(estimateId)).toBe(140);
  });

  it('updates total by delta when patching work quantity', async () => {
    const result = await EstimateRowsService.patch(teamId, estimateId, baseWorkId, { qty: 3 });

    expect(result.success).toBe(true);
    expect(await getEstimateTotal(estimateId)).toBe(360);
  });

  it('updates total by delta when patching work price', async () => {
    const result = await EstimateRowsService.patch(teamId, estimateId, baseWorkId, { price: 125 });

    expect(result.success).toBe(true);
    expect(await getEstimateTotal(estimateId)).toBe(150);
  });

  it('updates total by delta when deleting row', async () => {
    const removeResult = await EstimateRowsService.remove(teamId, estimateId, baseWorkId);

    expect(removeResult.success).toBe(true);
    expect(await getEstimateTotal(estimateId)).toBe(0);
  });

  it('includes child material deltas when work quantity changes', async () => {
    const materialResult = await EstimateRowsService.addMaterial(teamId, estimateId, baseWorkId, {
      name: 'Cascade material',
      unit: 'шт',
      qty: 3,
      price: 20,
      expense: 3,
    });

    expect(materialResult.success).toBe(true);
    if (!materialResult.success) {
      return;
    }

    const patchResult = await EstimateRowsService.patch(teamId, estimateId, baseWorkId, { qty: 2 });
    expect(patchResult.success).toBe(true);

    const [material] = await db
      .select({ qty: estimateRows.qty, sum: estimateRows.sum })
      .from(estimateRows)
      .where(and(eq(estimateRows.id, materialResult.data.id), isNull(estimateRows.deletedAt)));

    expect(material.qty).toBe(6);
    expect(material.sum).toBe(120);
    expect(await getEstimateTotal(estimateId)).toBe(360);
  });

  it('applies coefficient contribution during work mutations', async () => {
    const patchResult = await EstimateRowsService.patch(teamId, estimateId, baseWorkId, { qty: 2, price: 150 });

    expect(patchResult.success).toBe(true);
    expect(await getEstimateTotal(estimateId)).toBe(360);
  });

  it('repair recalculation restores exact total', async () => {
    await db.update(estimates).set({ total: 9999 }).where(eq(estimates.id, estimateId));

    await db.transaction(async (tx) => {
      await EstimateRowsMaintenance.recalculateEstimateTotal(tx, estimateId);
    });

    expect(await getEstimateTotal(estimateId)).toBe(120);
  });
});
