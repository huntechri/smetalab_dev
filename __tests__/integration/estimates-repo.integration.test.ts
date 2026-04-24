import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/lib/data/db/drizzle';
import { estimateRows, estimates, projects, teams } from '@/lib/data/db/schema';
import { resetDatabase } from '@/lib/data/db/test-utils';
import { getEstimatesByProjectId } from '@/lib/data/estimates/repo';

describe('getEstimatesByProjectId integration', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('returns persisted estimate total without aggregating estimate rows', async () => {
    const [team] = await db.insert(teams).values({ name: 'Repo Team' }).returning();

    const [project] = await db
      .insert(projects)
      .values({ tenantId: team.id, name: 'Repo Project', slug: 'repo-project' })
      .returning();

    const [estimate] = await db
      .insert(estimates)
      .values({
        tenantId: team.id,
        projectId: project.id,
        name: 'Estimate A',
        slug: 'estimate-a',
        total: 4321,
        coefPercent: 25,
      })
      .returning();

    await db.insert(estimateRows).values([
      {
        tenantId: team.id,
        estimateId: estimate.id,
        kind: 'work',
        code: '1',
        name: 'Work row',
        unit: 'h',
        qty: 1,
        price: 100,
        sum: 100,
        expense: 0,
        order: 100,
      },
      {
        tenantId: team.id,
        estimateId: estimate.id,
        kind: 'material',
        code: '1.1',
        name: 'Material row',
        unit: 'pcs',
        qty: 1,
        price: 50,
        sum: 50,
        expense: 0,
        order: 101,
      },
    ]);

    const result = await getEstimatesByProjectId(project.id, team.id);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(estimate.id);
    expect(result[0]?.total).toBe(4321);
  });
});
