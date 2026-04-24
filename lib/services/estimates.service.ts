import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/data/db/drizzle';
import { estimates, estimateRows, estimateExecutionRows, estimateRoomParams } from '@/lib/data/db/schema';
import { withActiveTenant } from '@/lib/data/db/queries';
import { error, Result, success } from '@/lib/utils/result';
import { ProjectStatusService } from './project-status.service';
import { invalidateHomeDashboardCache } from './home-dashboard-cache';

export class EstimateService {
    static async delete(teamId: number, estimateId: string): Promise<Result<{ projectId: string }>> {
        try {
            return await db.transaction(async (tx) => {
                const estimate = await tx.query.estimates.findFirst({
                    where: and(eq(estimates.id, estimateId), withActiveTenant(estimates, teamId)),
                });

                if (!estimate) {
                    throw new Error('NOT_FOUND');
                }

                const deletedAt = new Date();

                // Soft delete the estimate
                await tx
                    .update(estimates)
                    .set({ deletedAt, updatedAt: deletedAt })
                    .where(and(eq(estimates.id, estimateId), withActiveTenant(estimates, teamId)));

                // Soft delete related rows
                await tx
                    .update(estimateRows)
                    .set({ deletedAt, updatedAt: deletedAt })
                    .where(and(eq(estimateRows.estimateId, estimateId), withActiveTenant(estimateRows, teamId)));

                // Soft delete related execution rows
                await tx
                    .update(estimateExecutionRows)
                    .set({ deletedAt, updatedAt: deletedAt })
                    .where(and(eq(estimateExecutionRows.estimateId, estimateId), withActiveTenant(estimateExecutionRows, teamId)));

                // Soft delete related room params
                await tx
                    .update(estimateRoomParams)
                    .set({ deletedAt, updatedAt: deletedAt })
                    .where(and(eq(estimateRoomParams.estimateId, estimateId), withActiveTenant(estimateRoomParams, teamId)));

                // Refresh project status because it depends on estimate statuses
                // Use the transaction to see its own updates
                await ProjectStatusService.refreshForProject(teamId, estimate.projectId, tx);

                invalidateHomeDashboardCache(teamId);
                return success({ projectId: estimate.projectId });
            });
        } catch (err) {
            if (err instanceof Error && err.message === 'NOT_FOUND') {
                return error('Смета не найдена', 'NOT_FOUND');
            }

            console.error('EstimateService.delete error:', err);
            return error('Ошибка при удалении сметы', 'DELETE_FAILED');
        }
    }
}
