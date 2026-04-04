import { sql } from 'drizzle-orm';

import { withActiveTenant } from '@/lib/data/db/queries';
import { db } from '@/lib/data/db/drizzle';
import { estimateExecutionRows, estimateRows, estimates, globalPurchases, projectReceipts, projects } from '@/lib/data/db/schema';

export type ProjectDashboardKpiData = {
    confirmedReceipts: number;
    plannedWorks: number;
    plannedMaterials: number;
    actualWorks: number;
    actualMaterials: number;
};

export type ProjectDashboardKpiViewModel = {
    revenue: number;
    expense: number;
    profit: number;
    progress: number;
    remainingDays: number | null;
};

export type ProjectDashboardKpiExplainResult = {
    totalRows: number;
    plan: string[];
};

const msInDay = 1000 * 60 * 60 * 24;

export function calculateDaysRemaining(endDate: Date | null, now: Date = new Date()): number | null {
    if (!endDate) {
        return null;
    }

    const diffMs = endDate.getTime() - now.getTime();
    if (diffMs >= 0) {
        return Math.ceil(diffMs / msInDay);
    }

    return Math.floor(diffMs / msInDay);
}

export function buildProjectDashboardKpiViewModel(input: {
    finance: ProjectDashboardKpiData;
    progress: number;
    endDate: Date | null;
    now?: Date;
}): ProjectDashboardKpiViewModel {
    const revenue = input.finance.confirmedReceipts;
    const expense = input.finance.actualWorks + input.finance.actualMaterials;

    return {
        revenue,
        expense,
        profit: revenue - expense,
        progress: input.progress,
        remainingDays: calculateDaysRemaining(input.endDate, input.now),
    };
}

export class ProjectDashboardKpiService {
    private static isMissingProjectReceiptsTable(serviceError: unknown) {
        if (!serviceError || typeof serviceError !== 'object') return false;
        const maybeCause = (serviceError as { cause?: { code?: string } }).cause;
        return maybeCause?.code === '42P01';
    }

    private static buildTotalsQuery(teamId: number, projectId: string) {
        return sql<ProjectDashboardKpiData>`
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
                    ${estimates.projectId} = ${projectId}
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
                    ${estimates.projectId} = ${projectId}
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
                    ${globalPurchases.projectId} = ${projectId}
                    AND ${withActiveTenant(globalPurchases, teamId)}
                    AND ${withActiveTenant(projects, teamId)}
            ),
            receipt_totals AS (
                SELECT
                    COALESCE(SUM(${projectReceipts.amount}), 0) AS confirmed_receipts
                FROM ${projectReceipts}
                INNER JOIN ${projects}
                    ON ${projects.id} = ${projectReceipts.projectId}
                WHERE
                    ${projectReceipts.projectId} = ${projectId}
                    AND ${projectReceipts.status} = 'confirmed'
                    AND ${withActiveTenant(projectReceipts, teamId)}
                    AND ${withActiveTenant(projects, teamId)}
            )
            SELECT
                receipt_totals.confirmed_receipts AS "confirmedReceipts",
                execution_totals.planned_works AS "plannedWorks",
                material_totals.planned_materials AS "plannedMaterials",
                execution_totals.actual_works AS "actualWorks",
                purchase_totals.actual_materials AS "actualMaterials"
            FROM execution_totals
            CROSS JOIN material_totals
            CROSS JOIN purchase_totals
            CROSS JOIN receipt_totals
        `;
    }

    private static buildTotalsQueryWithoutReceipts(teamId: number, projectId: string) {
        return sql<Omit<ProjectDashboardKpiData, 'confirmedReceipts'>>`
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
                    ${estimates.projectId} = ${projectId}
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
                    ${estimates.projectId} = ${projectId}
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
                    ${globalPurchases.projectId} = ${projectId}
                    AND ${withActiveTenant(globalPurchases, teamId)}
                    AND ${withActiveTenant(projects, teamId)}
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

    private static buildProjectFootprintQuery(teamId: number, projectId: string) {
        return sql<{ totalRows: number }>`
            SELECT (
                SELECT COUNT(*)
                FROM ${estimateExecutionRows}
                INNER JOIN ${estimates}
                    ON ${estimates.id} = ${estimateExecutionRows.estimateId}
                WHERE
                    ${estimates.projectId} = ${projectId}
                    AND ${withActiveTenant(estimateExecutionRows, teamId)}
                    AND ${withActiveTenant(estimates, teamId)}
            )
            + (
                SELECT COUNT(*)
                FROM ${estimateRows}
                INNER JOIN ${estimates}
                    ON ${estimates.id} = ${estimateRows.estimateId}
                WHERE
                    ${estimates.projectId} = ${projectId}
                    AND ${estimateRows.kind} = 'material'
                    AND ${withActiveTenant(estimateRows, teamId)}
                    AND ${withActiveTenant(estimates, teamId)}
            )
            + (
                SELECT COUNT(*)
                FROM ${globalPurchases}
                WHERE
                    ${globalPurchases.projectId} = ${projectId}
                    AND ${withActiveTenant(globalPurchases, teamId)}
            ) AS "totalRows"
        `;
    }

    static async getByProjectId(teamId: number, projectId: string): Promise<ProjectDashboardKpiData> {
        let totals: Partial<ProjectDashboardKpiData> | undefined;

        try {
            const rows = await db.execute(this.buildTotalsQuery(teamId, projectId));
            totals = rows[0];
        } catch (serviceError) {
            if (!this.isMissingProjectReceiptsTable(serviceError)) {
                throw serviceError;
            }

            const fallbackRows = await db.execute(this.buildTotalsQueryWithoutReceipts(teamId, projectId));
            totals = fallbackRows[0];
        }

        return {
            confirmedReceipts: Number(totals?.confirmedReceipts ?? 0),
            plannedWorks: Number(totals?.plannedWorks ?? 0),
            plannedMaterials: Number(totals?.plannedMaterials ?? 0),
            actualWorks: Number(totals?.actualWorks ?? 0),
            actualMaterials: Number(totals?.actualMaterials ?? 0),
        };
    }

    static async runExplainChecksForLargeProject(
        teamId: number,
        projectId: string,
        options?: { rowThreshold?: number },
    ): Promise<ProjectDashboardKpiExplainResult | null> {
        const rowThreshold = options?.rowThreshold ?? 50_000;
        const footprintRows = await db.execute(this.buildProjectFootprintQuery(teamId, projectId));
        const totalRows = Number(footprintRows[0]?.totalRows ?? 0);

        if (totalRows < rowThreshold) {
            return null;
        }

        const explainRows = await db.execute<{ 'QUERY PLAN': string }>(
            sql`EXPLAIN ${this.buildTotalsQuery(teamId, projectId)}`,
        );

        return {
            totalRows,
            plan: explainRows.map((row) => row['QUERY PLAN']),
        };
    }
}
