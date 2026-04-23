import { sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

import { withActiveTenant } from '@/lib/data/db/queries';
import { db } from '@/lib/data/db/drizzle';
import { estimateExecutionRows, estimates, globalPurchases, projectReceipts, projects } from '@/lib/data/db/schema';
import { calculateDaysRemaining } from './project-dashboard-kpi.service';

type HomeDashboardKpiFinance = {
    confirmedReceipts: number;
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
    private static isMissingProjectReceiptsTable(serviceError: unknown) {
        if (!serviceError || typeof serviceError !== 'object') return false;
        const maybeCause = (serviceError as { cause?: { code?: string } }).cause;
        return maybeCause?.code === '42P01';
    }

    private static buildFinanceTotalsQuery(teamId: number) {
        return sql<HomeDashboardKpiFinance>`
            WITH execution_totals AS (
                SELECT
                    COALESCE(SUM(${estimateExecutionRows.actualSum}), 0) AS actual_works
                FROM ${estimateExecutionRows}
                INNER JOIN ${estimates}
                    ON ${estimates.id} = ${estimateExecutionRows.estimateId}
                INNER JOIN ${projects}
                    ON ${projects.id} = ${estimates.projectId}
                WHERE
                    ${projects.status} IN ('active', 'completed')
                    AND ${estimateExecutionRows.status} = 'done'
                    AND ${withActiveTenant(estimateExecutionRows, teamId)}
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
            ),
            receipt_totals AS (
                SELECT
                    COALESCE(SUM(${projectReceipts.amount}), 0) AS confirmed_receipts
                FROM ${projectReceipts}
                INNER JOIN ${projects}
                    ON ${projects.id} = ${projectReceipts.projectId}
                WHERE
                    ${projects.status} IN ('active', 'completed')
                    AND ${projectReceipts.status} = 'confirmed'
                    AND ${withActiveTenant(projectReceipts, teamId)}
                    AND ${withActiveTenant(projects, teamId)}
            )
            SELECT
                receipt_totals.confirmed_receipts AS "confirmedReceipts",
                execution_totals.actual_works AS "actualWorks",
                purchase_totals.actual_materials AS "actualMaterials"
            FROM execution_totals
            CROSS JOIN purchase_totals
            CROSS JOIN receipt_totals
        `;
    }

    private static buildFinanceTotalsQueryWithoutReceipts(teamId: number) {
        return sql<Omit<HomeDashboardKpiFinance, 'confirmedReceipts'>>`
            WITH execution_totals AS (
                SELECT
                    COALESCE(SUM(${estimateExecutionRows.actualSum}), 0) AS actual_works
                FROM ${estimateExecutionRows}
                INNER JOIN ${estimates}
                    ON ${estimates.id} = ${estimateExecutionRows.estimateId}
                INNER JOIN ${projects}
                    ON ${projects.id} = ${estimates.projectId}
                WHERE
                    ${projects.status} IN ('active', 'completed')
                    AND ${estimateExecutionRows.status} = 'done'
                    AND ${withActiveTenant(estimateExecutionRows, teamId)}
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
                execution_totals.actual_works AS "actualWorks",
                purchase_totals.actual_materials AS "actualMaterials"
            FROM execution_totals
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

    private static async getByTeamIdUncached(teamId: number): Promise<HomeDashboardKpiViewModel> {
        let financeRows: Array<Partial<HomeDashboardKpiFinance>>;

        try {
            financeRows = await db.execute(this.buildFinanceTotalsQuery(teamId));
        } catch (serviceError) {
            if (!this.isMissingProjectReceiptsTable(serviceError)) {
                throw serviceError;
            }

            financeRows = await db.execute(this.buildFinanceTotalsQueryWithoutReceipts(teamId));
        }

        const projectsRows = await db.execute(this.buildProjectsSummaryQuery(teamId));

        const finance = financeRows[0];
        const projectsSummary = projectsRows[0];

        const confirmedReceipts = Number(finance?.confirmedReceipts ?? 0);
        const actualWorks = Number(finance?.actualWorks ?? 0);
        const actualMaterials = Number(finance?.actualMaterials ?? 0);

        const revenue = confirmedReceipts;
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

    static async getByTeamId(teamId: number): Promise<HomeDashboardKpiViewModel> {
        return unstable_cache(
            () => this.getByTeamIdUncached(teamId),
            [`home-dashboard-kpi-${teamId}`],
            {
                revalidate: 120,
                tags: ['home-dashboard-kpi', `home-dashboard-kpi-${teamId}`],
            },
        )();
    }
}
