import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/data/db/drizzle';
import { estimateExecutionRows, estimates, projects } from '@/lib/data/db/schema';
import { withActiveTenant } from '@/lib/data/db/queries';

export type ProjectProgressMetrics = {
  totalWorks: number;
  completedWorks: number;
  percent: number;
};

export function calculateProjectProgress(completedWorks: number, totalWorks: number): number {
  if (totalWorks <= 0) {
    return 0;
  }

  return Math.round((completedWorks / totalWorks) * 100);
}

export class ProjectProgressService {
  static async refreshForProject(teamId: number, projectId: string) {
    const [progressStats] = await db
      .select({
        totalWorks: sql<number>`count(*)`,
        completedWorks: sql<number>`count(*) filter (where ${estimateExecutionRows.status} = 'done')`,
      })
      .from(estimateExecutionRows)
      .innerJoin(estimates, eq(estimateExecutionRows.estimateId, estimates.id))
      .where(
        and(
          eq(estimates.projectId, projectId),
          withActiveTenant(estimateExecutionRows, teamId),
          withActiveTenant(estimates, teamId),
        ),
      );

    // PERF: Aggregate in SQL to avoid loading every execution row into Node.js memory.
    // Expected impact: O(1) rows transferred instead of O(n), faster on large projects.
    const totalWorks = Number(progressStats?.totalWorks ?? 0);
    const completedWorks = Number(progressStats?.completedWorks ?? 0);
    const percent = calculateProjectProgress(completedWorks, totalWorks);

    await db
      .update(projects)
      .set({ progress: percent, updatedAt: new Date() })
      .where(and(eq(projects.id, projectId), withActiveTenant(projects, teamId)));

    const metrics: ProjectProgressMetrics = {
      totalWorks,
      completedWorks,
      percent,
    };

    return metrics;
  }
}
