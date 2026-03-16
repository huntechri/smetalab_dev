import { and, eq, exists, gte, lte, sql } from 'drizzle-orm';

import { db } from '@/lib/data/db/drizzle';
import { withActiveTenant } from '@/lib/data/db/queries';
import { estimateExecutionRows, estimateRows, estimates, globalPurchases } from '@/lib/data/db/schema';
import { buildPerformanceDynamics, PerformanceDynamicsPoint } from './project-performance-dynamics.service';

const ESTIMATE_STATUS_IN_PROGRESS = 'in_progress' as const;

const toIsoDate = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const toIsoTimestamp = (value: Date) => value.toISOString();
const endOfMonth = (value: Date) => new Date(value.getFullYear(), value.getMonth() + 1, 0, 23, 59, 59, 999);

export class HomePerformanceDynamicsService {
    static async listByTeamId(teamId: number): Promise<PerformanceDynamicsPoint[]> {
        const today = new Date();
        const periodEnd = endOfMonth(today);
        const startDate = new Date(periodEnd.getFullYear(), periodEnd.getMonth() - 11, 1);
        const rangeStartTimestamp = toIsoTimestamp(startDate);
        const rangeEndTimestamp = toIsoTimestamp(periodEnd);

        const [executionPlanRows, executionFactRows, procurementPlanRows, procurementFactRows] = await Promise.all([
            db
                .select({
                    date: sql<string>`DATE(${estimateExecutionRows.createdAt})`,
                    total: sql<number>`COALESCE(SUM(${estimateExecutionRows.plannedSum}), 0)`,
                })
                .from(estimateExecutionRows)
                .innerJoin(estimates, eq(estimates.id, estimateExecutionRows.estimateId))
                .where(
                    and(
                        eq(estimates.status, ESTIMATE_STATUS_IN_PROGRESS),
                        withActiveTenant(estimates, teamId),
                        withActiveTenant(estimateExecutionRows, teamId),
                        gte(estimateExecutionRows.createdAt, startDate),
                        lte(estimateExecutionRows.createdAt, periodEnd),
                    ),
                )
                .groupBy(sql`DATE(${estimateExecutionRows.createdAt})`),
            db
                .select({
                    date: sql<string>`DATE(${estimateExecutionRows.completedAt})`,
                    total: sql<number>`COALESCE(SUM(${estimateExecutionRows.actualSum}), 0)`,
                })
                .from(estimateExecutionRows)
                .innerJoin(estimates, eq(estimates.id, estimateExecutionRows.estimateId))
                .where(
                    and(
                        eq(estimates.status, ESTIMATE_STATUS_IN_PROGRESS),
                        withActiveTenant(estimates, teamId),
                        withActiveTenant(estimateExecutionRows, teamId),
                        sql`${estimateExecutionRows.completedAt} IS NOT NULL`,
                        sql`${estimateExecutionRows.completedAt} >= ${rangeStartTimestamp}::timestamp`,
                        sql`${estimateExecutionRows.completedAt} <= ${rangeEndTimestamp}::timestamp`,
                        sql`${estimateExecutionRows.actualSum} > 0`,
                    ),
                )
                .groupBy(sql`DATE(${estimateExecutionRows.completedAt})`),
            db
                .select({
                    date: sql<string>`DATE(${estimateRows.createdAt})`,
                    total: sql<number>`COALESCE(SUM(${estimateRows.qty} * ${estimateRows.price}), 0)`,
                })
                .from(estimateRows)
                .innerJoin(estimates, eq(estimates.id, estimateRows.estimateId))
                .where(
                    and(
                        eq(estimates.status, ESTIMATE_STATUS_IN_PROGRESS),
                        eq(estimateRows.kind, 'material'),
                        withActiveTenant(estimates, teamId),
                        withActiveTenant(estimateRows, teamId),
                        gte(estimateRows.createdAt, startDate),
                        lte(estimateRows.createdAt, periodEnd),
                    ),
                )
                .groupBy(sql`DATE(${estimateRows.createdAt})`),
            db
                .select({
                    date: globalPurchases.purchaseDate,
                    total: sql<number>`COALESCE(SUM(${globalPurchases.qty} * ${globalPurchases.price}), 0)`,
                })
                .from(globalPurchases)
                .where(
                    and(
                        withActiveTenant(globalPurchases, teamId),
                        sql`${globalPurchases.projectId} IS NOT NULL`,
                        exists(
                            db
                                .select({ id: estimates.id })
                                .from(estimates)
                                .where(
                                    and(
                                        eq(estimates.projectId, globalPurchases.projectId),
                                        eq(estimates.status, ESTIMATE_STATUS_IN_PROGRESS),
                                        withActiveTenant(estimates, teamId),
                                    ),
                                ),
                        ),
                        gte(globalPurchases.purchaseDate, toIsoDate(startDate)),
                        lte(globalPurchases.purchaseDate, toIsoDate(periodEnd)),
                    ),
                )
                .groupBy(globalPurchases.purchaseDate),
        ]);

        return buildPerformanceDynamics(
            executionPlanRows,
            executionFactRows,
            procurementPlanRows,
            procurementFactRows,
        );
    }
}
