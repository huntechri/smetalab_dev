import { and, eq, sql } from 'drizzle-orm';

import { withActiveTenant } from '@/lib/data/db/queries';
import { db } from '@/lib/data/db/drizzle';
import { estimateExecutionRows, estimateRows, estimates, globalPurchases } from '@/lib/data/db/schema';

export type ProjectDashboardKpiData = {
    plannedWorks: number;
    plannedMaterials: number;
    actualWorks: number;
    actualMaterials: number;
};

export type ProjectDashboardKpiViewModel = {
    revenue: number;
    profit: number;
    progress: number;
    remainingDays: number | null;
};

const msInDay = 1000 * 60 * 60 * 24;

export function calculateDaysRemaining(endDate: Date | null, now: Date = new Date()): number | null {
    if (!endDate) {
        return null;
    }

    const diffMs = endDate.getTime() - now.getTime();
    if (diffMs <= 0) {
        return 0;
    }

    return Math.ceil(diffMs / msInDay);
}

export function buildProjectDashboardKpiViewModel(input: {
    finance: ProjectDashboardKpiData;
    progress: number;
    endDate: Date | null;
    now?: Date;
}): ProjectDashboardKpiViewModel {
    const revenue = input.finance.plannedWorks + input.finance.plannedMaterials;
    const totalActual = input.finance.actualWorks + input.finance.actualMaterials;

    return {
        revenue,
        profit: revenue - totalActual,
        progress: input.progress,
        remainingDays: calculateDaysRemaining(input.endDate, input.now),
    };
}

export class ProjectDashboardKpiService {
    static async getByProjectId(teamId: number, projectId: string): Promise<ProjectDashboardKpiData> {
        const [plannedWorksRow, actualWorksRow, plannedMaterialsRow, actualMaterialsRow] = await Promise.all([
            db
                .select({
                    total: sql<number>`COALESCE(SUM(${estimateExecutionRows.plannedSum}), 0)`,
                })
                .from(estimateExecutionRows)
                .innerJoin(estimates, eq(estimates.id, estimateExecutionRows.estimateId))
                .where(
                    and(
                        eq(estimates.projectId, projectId),
                        withActiveTenant(estimateExecutionRows, teamId),
                        withActiveTenant(estimates, teamId),
                    ),
                ),
            db
                .select({
                    total: sql<number>`COALESCE(SUM(${estimateExecutionRows.actualSum}), 0)`,
                })
                .from(estimateExecutionRows)
                .innerJoin(estimates, eq(estimates.id, estimateExecutionRows.estimateId))
                .where(
                    and(
                        eq(estimates.projectId, projectId),
                        withActiveTenant(estimateExecutionRows, teamId),
                        withActiveTenant(estimates, teamId),
                    ),
                ),
            db
                .select({
                    total: sql<number>`COALESCE(SUM(${estimateRows.qty} * ${estimateRows.price}), 0)`,
                })
                .from(estimateRows)
                .innerJoin(estimates, eq(estimates.id, estimateRows.estimateId))
                .where(
                    and(
                        eq(estimates.projectId, projectId),
                        eq(estimateRows.kind, 'material'),
                        withActiveTenant(estimateRows, teamId),
                        withActiveTenant(estimates, teamId),
                    ),
                ),
            db
                .select({
                    total: sql<number>`COALESCE(SUM(${globalPurchases.qty} * ${globalPurchases.price}), 0)`,
                })
                .from(globalPurchases)
                .where(
                    and(
                        eq(globalPurchases.projectId, projectId),
                        withActiveTenant(globalPurchases, teamId),
                    ),
                ),
        ]);

        return {
            plannedWorks: Number(plannedWorksRow[0]?.total ?? 0),
            plannedMaterials: Number(plannedMaterialsRow[0]?.total ?? 0),
            actualWorks: Number(actualWorksRow[0]?.total ?? 0),
            actualMaterials: Number(actualMaterialsRow[0]?.total ?? 0),
        };
    }
}
