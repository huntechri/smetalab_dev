import { and, eq } from 'drizzle-orm';
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

export class ProjectStatusService {
  static async refreshForProject(
    teamId: number,
    projectId: string,
    dbOrTx: Pick<typeof db, 'select' | 'update'> = db,
  ) {
    const projectEstimates = await dbOrTx
      .select({ status: estimates.status })
      .from(estimates)
      .where(and(eq(estimates.projectId, projectId), withActiveTenant(estimates, teamId)));

    const nextStatus = resolveProjectStatusFromEstimateStatuses(projectEstimates.map((row: { status: DbEstimateStatus }) => row.status));

    await dbOrTx
      .update(projects)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(and(eq(projects.id, projectId), withActiveTenant(projects, teamId)));

    return nextStatus;
  }
}
