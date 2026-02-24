import { and, eq } from 'drizzle-orm';
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
    const rows = await db
      .select({
        status: estimateExecutionRows.status,
      })
      .from(estimateExecutionRows)
      .innerJoin(estimates, eq(estimateExecutionRows.estimateId, estimates.id))
      .where(
        and(
          eq(estimates.projectId, projectId),
          eq(estimateExecutionRows.source, 'from_estimate'),
          withActiveTenant(estimateExecutionRows, teamId),
          withActiveTenant(estimates, teamId),
        ),
      );

    const totalWorks = rows.length;
    const completedWorks = rows.filter((row) => row.status === 'done').length;
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
