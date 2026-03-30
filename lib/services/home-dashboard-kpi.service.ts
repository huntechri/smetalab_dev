import { sql } from 'drizzle-orm';

import { withActiveTenant } from '@/lib/data/db/queries';
import { db } from '@/lib/data/db/drizzle';
import { estimateExecutionRows, estimateRows, estimates, globalPurchases, projects } from '@/lib/data/db/schema';
import { calculateDaysRemaining } from './project-dashboard-kpi.service';

type HomeDashboardKpiFinance = {
    plannedWorks: number;
    plannedMaterials: number;
    actualWorks: number;
    actualMaterials: number;
};

type HomeDashboardProjectsSummary = {
    avgProgress: number;
    nearestEndDate: Date | string | null;
};

export type HomeDashboardKpiViewModel = {
    revenue: number;
    expense: number;
    profit: number;
    progress: number;
    remainingDays: number | null;
};

const parseOptionalDate = (value: unknown): Date | null => {
    if (value instanceof Date) {
        return value;
    }

    if (typeof value === 'string' || typeof value === 'number') {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
};

export class HomeDashboardKpiService {
    private static buildFinanceTotalsQuery(teamId: number) {
        return sql<HomeDashboardKpiFinance>`
            WITH execution_totals AS (
                SELECT
                    COALESCE(SUM(${estimateExecutionRows.plannedSum}), 0) AS planned_works,
                    COALESCE(SUM(${estimateExecutionRows.actualSum}), 0) AS actual_works
                FROM ${estimateExecutionRows}
                INNER JOIN ${estimates}
                    ON ${estimates.id} = ${estimateExecutionRows.estimateId}
                INNER JOIN ${projects}
                    ON ${projects.id} = ${estimates.projectId}
                WHERE
                    ${projects.status} IN ('active', 'completed')
                    AND ${withActiveTenant(estimateExecutionRows, teamId)}
                    AND ${withActiveTenant(estimates, teamId)}
                    AND ${withActiveTenant(projects, teamId)}
            ),
            material_totals AS (
                SELECT
                    COALESCE(SUM(${estimateRows.qty} * ${estimateRows.price}), 0) AS planned_materials
                FROM ${estimateRows}
                INNER JOIN ${estimates}
                    ON ${estimates.id} = ${estimateRows.estimateId}
                INNER JOIN ${projects}
                    ON ${projects.id} = ${estimates.projectId}
                WHERE
                    ${projects.status} IN ('active', 'completed')
                    AND ${estimateRows.kind} = 'material'
                    AND ${withActiveTenant(estimateRows, teamId)}
                    AND ${withActiveTenant(estimates, teamId)}
                    AND ${withActiveTenant(projects, teamId)}
            ),
            purchase_totals AS (
                SELECT
                    COALESCE(SUM(${globalPurchases.qty} * ${globalPurchases.price}), 0) AS actual_materials
                FROM ${globalPurchases}
                INNER JOIN ${projects}
                    ON ${projects.id} = ${globalPurchases.projectId}
                WHERE
                    ${projects.status} IN ('active', 'completed')
                    AND ${withActiveTenant(globalPurchases, teamId)}
                    AND ${withActiveTenant(projects, teamId)}
                    AND ${globalPurchases.projectId} IS NOT NULL
            )
            SELECT
                execution_totals.planned_works AS "plannedWorks",
                material_totals.planned_materials AS "plannedMaterials",
                execution_totals.actual_works AS "actualWorks",
                purchase_totals.actual_materials AS "actualMaterials"
            FROM execution_totals
            CROSS JOIN material_totals
            CROSS JOIN purchase_totals
        `;
    }

    private static buildProjectsSummaryQuery(teamId: number) {
        return sql<HomeDashboardProjectsSummary>`
            SELECT
                COALESCE(ROUND(AVG(${projects.progress})), 0) AS "avgProgress",
                MIN(${projects.endDate}) FILTER (WHERE ${projects.status} = 'active') AS "nearestEndDate"
            FROM ${projects}
            WHERE 
                ${projects.status} IN ('active', 'completed')
                AND ${withActiveTenant(projects, teamId)}
        `;
    }

    static async getByTeamId(teamId: number): Promise<HomeDashboardKpiViewModel> {
        const [financeRows, projectsRows] = await Promise.all([
            db.execute(this.buildFinanceTotalsQuery(teamId)),
            db.execute(this.buildProjectsSummaryQuery(teamId)),
        ]);

        const finance = financeRows[0];
        const projectsSummary = projectsRows[0];

        const plannedWorks = Number(finance?.plannedWorks ?? 0);
        const plannedMaterials = Number(finance?.plannedMaterials ?? 0);
        const actualWorks = Number(finance?.actualWorks ?? 0);
        const actualMaterials = Number(finance?.actualMaterials ?? 0);

        const revenue = plannedWorks + plannedMaterials;
        const totalActual = actualWorks + actualMaterials;
        const nearestEndDateValue = projectsSummary?.nearestEndDate;
        const nearestEndDate = parseOptionalDate(nearestEndDateValue);

        return {
            revenue,
            expense: totalActual,
            profit: revenue - totalActual,
            progress: Number(projectsSummary?.avgProgress ?? 0),
            remainingDays: calculateDaysRemaining(nearestEndDate),
        };
    }
}
