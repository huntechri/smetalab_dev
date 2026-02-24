import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/data/db/drizzle';
import { estimates, projects } from '@/lib/data/db/schema';
import { withActiveTenant } from '@/lib/data/db/queries';
import { error, Result, success } from '@/lib/utils/result';
import { resolveProjectStatusFromEstimateStatuses } from './project-status.service';

const updateEstimateStatusSchema = z.object({
  status: z.enum(['draft', 'in_progress', 'approved']),
});

export class EstimateStatusService {
  static async update(teamId: number, estimateId: string, rawPayload: unknown): Promise<Result<{ status: 'draft' | 'in_progress' | 'approved' }>> {
    const parsed = updateEstimateStatusSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');
    }

    try {
      const payload = parsed.data;

      const updatedEstimate = await db.transaction(async (tx) => {
        const estimate = await tx.query.estimates.findFirst({
          where: and(eq(estimates.id, estimateId), withActiveTenant(estimates, teamId)),
        });

        if (!estimate) {
          throw new Error('NOT_FOUND');
        }

        const [updated] = await tx
          .update(estimates)
          .set({ status: payload.status, updatedAt: new Date() })
          .where(and(eq(estimates.id, estimateId), withActiveTenant(estimates, teamId)))
          .returning({ id: estimates.id, status: estimates.status, projectId: estimates.projectId });

        const projectEstimateStatuses = await tx
          .select({ status: estimates.status })
          .from(estimates)
          .where(and(eq(estimates.projectId, estimate.projectId), withActiveTenant(estimates, teamId)));

        const nextProjectStatus = resolveProjectStatusFromEstimateStatuses(projectEstimateStatuses.map((row) => row.status));

        await tx
          .update(projects)
          .set({ status: nextProjectStatus, updatedAt: new Date() })
          .where(and(eq(projects.id, estimate.projectId), withActiveTenant(projects, teamId)));

        return updated;
      });

      if (!updatedEstimate) {
        return error('Не удалось обновить статус сметы', 'UPDATE_FAILED');
      }

      return success({ status: updatedEstimate.status });
    } catch (err) {
      if (err instanceof Error && err.message === 'NOT_FOUND') {
        return error('Смета не найдена', 'NOT_FOUND');
      }

      console.error('EstimateStatusService.update error:', err);
      return error('Ошибка при обновлении статуса сметы', 'UPDATE_FAILED');
    }
  }
}

