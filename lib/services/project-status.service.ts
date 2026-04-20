import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/data/db/drizzle';
import { estimates, projects } from '@/lib/data/db/schema';
import { withActiveTenant } from '@/lib/data/db/queries';

type DbEstimateStatus = 'draft' | 'in_progress' | 'approved';
type DbProjectStatus = 'planned' | 'active' | 'completed' | 'paused';

export function resolveProjectStatusFromEstimateStatuses(statuses: DbEstimateStatus[]): DbProjectStatus {
  if (statuses.length === 0) {
    return 'planned';
  }

  const allCompleted = statuses.every((status) => status === 'approved');
  if (allCompleted) {
    return 'completed';
  }

  const hasInProgressOrCompleted = statuses.some((status) => status === 'in_progress' || status === 'approved');
  if (hasInProgressOrCompleted) {
    return 'active';
  }

  return 'planned';
}

export function resolveProjectStatusFromCounts(total: number, approved: number, active: number): DbProjectStatus {
  if (total <= 0) {
    return 'planned';
  }

  if (approved === total) {
    return 'completed';
  }

  if (active > 0) {
    return 'active';
  }

  return 'planned';
}

export class ProjectStatusService {
  static async refreshForProject(
    teamId: number,
    projectId: string,
    dbOrTx: Pick<typeof db, 'select' | 'update'> = db,
  ) {
    const [statusStats] = await dbOrTx
      .select({
        total: sql<number>`count(*)`,
        approved: sql<number>`count(*) filter (where ${estimates.status} = 'approved')`,
        active: sql<number>`count(*) filter (where ${estimates.status} in ('in_progress', 'approved'))`,
      })
      .from(estimates)
      .where(and(eq(estimates.projectId, projectId), withActiveTenant(estimates, teamId)));

    // PERF: We only need aggregate counters for project status; avoid loading all estimate statuses.
    const nextStatus = resolveProjectStatusFromCounts(
      Number(statusStats?.total ?? 0),
      Number(statusStats?.approved ?? 0),
      Number(statusStats?.active ?? 0),
    );

    await dbOrTx
      .update(projects)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(and(eq(projects.id, projectId), withActiveTenant(projects, teamId)));

    return nextStatus;
  }
}
