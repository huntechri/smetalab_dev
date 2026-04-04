import { and, eq, exists, gte, inArray, lte, sql } from 'drizzle-orm';

import { db } from '@/lib/data/db/drizzle';
import { withActiveTenant } from '@/lib/data/db/queries';
import { estimateExecutionRows, estimateRows, estimates, globalPurchases, projectReceipts } from '@/lib/data/db/schema';

export type PerformanceDynamicsPoint = {
    date: string;
    receiptsFact: number;
    executionPlan: number;
    executionFact: number;
    procurementPlan: number;
    procurementFact: number;
};

type AggregateRow = {
    date: string;
    total: number;
};

const toIsoDate = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};
const toIsoTimestamp = (value: Date) => value.toISOString();
const ESTIMATE_STATUS_IN_PROGRESS = 'in_progress' as const;
const ESTIMATE_STATUS_APPROVED = 'approved' as const;
const ESTIMATE_VISIBLE_STATUSES = [ESTIMATE_STATUS_IN_PROGRESS, ESTIMATE_STATUS_APPROVED] as const;
const endOfMonth = (value: Date) => new Date(value.getFullYear(), value.getMonth() + 1, 0, 23, 59, 59, 999);

const normalizeMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const toDateKey = (raw: string | Date) => {
    if (raw instanceof Date) {
        return toIsoDate(raw);
    }

    return raw.slice(0, 10);
};

export const buildPerformanceDynamics = (
    receiptsFactRows: AggregateRow[],
    executionPlanRows: AggregateRow[],
    executionFactRows: AggregateRow[],
    procurementPlanRows: AggregateRow[],
    procurementFactRows: AggregateRow[],
): PerformanceDynamicsPoint[] => {
    const seriesByDate = new Map<string, PerformanceDynamicsPoint>();

    const ensurePoint = (date: string) => {
        const existing = seriesByDate.get(date);
        if (existing) return existing;

        const point: PerformanceDynamicsPoint = {
            date,
            receiptsFact: 0,
            executionPlan: 0,
            executionFact: 0,
            procurementPlan: 0,
            procurementFact: 0,
        };
        seriesByDate.set(date, point);
        return point;
    };

    for (const row of receiptsFactRows) {
        const point = ensurePoint(toDateKey(row.date));
        point.receiptsFact = normalizeMoney(point.receiptsFact + row.total);
    }

    for (const row of executionPlanRows) {
        const point = ensurePoint(toDateKey(row.date));
        point.executionPlan = normalizeMoney(point.executionPlan + row.total);
    }

    for (const row of executionFactRows) {
        const point = ensurePoint(toDateKey(row.date));
        point.executionFact = normalizeMoney(point.executionFact + row.total);
    }

    for (const row of procurementPlanRows) {
        const point = ensurePoint(toDateKey(row.date));
        point.procurementPlan = normalizeMoney(point.procurementPlan + row.total);
    }

    for (const row of procurementFactRows) {
        const point = ensurePoint(toDateKey(row.date));
        point.procurementFact = normalizeMoney(point.procurementFact + row.total);
    }

    return [...seriesByDate.values()].sort((a, b) => a.date.localeCompare(b.date));
};

export class ProjectPerformanceDynamicsService {
    private static isMissingProjectReceiptsTable(serviceError: unknown) {
        if (!serviceError || typeof serviceError !== 'object') return false;
        const maybeCause = (serviceError as { cause?: { code?: string } }).cause;
        return maybeCause?.code === '42P01';
    }

    static async list(teamId: number, projectId: string): Promise<PerformanceDynamicsPoint[]> {
        const today = new Date();
        const periodEnd = endOfMonth(today);
        const startDate = new Date(periodEnd.getFullYear(), periodEnd.getMonth() - 11, 1);
        const rangeStartTimestamp = toIsoTimestamp(startDate);
        const rangeEndTimestamp = toIsoTimestamp(periodEnd);

        const receiptsFactRowsPromise = db
            .select({
                date: projectReceipts.receiptDate,
                total: sql<number>`COALESCE(SUM(${projectReceipts.amount}), 0)`,
            })
            .from(projectReceipts)
            .where(
                and(
                    eq(projectReceipts.projectId, projectId),
                    eq(projectReceipts.status, 'confirmed'),
                    withActiveTenant(projectReceipts, teamId),
                    gte(projectReceipts.receiptDate, toIsoDate(startDate)),
                    lte(projectReceipts.receiptDate, toIsoDate(periodEnd)),
                ),
            )
            .groupBy(projectReceipts.receiptDate)
            .catch((serviceError) => {
                if (!this.isMissingProjectReceiptsTable(serviceError)) {
                    throw serviceError;
                }

                return [];
            });

        const [receiptsFactRows, executionPlanRows, executionFactRows, procurementPlanRows, procurementFactRows] = await Promise.all([
            receiptsFactRowsPromise,
            db
                .select({
                    date: sql<string>`DATE(${estimateExecutionRows.createdAt})`,
                    total: sql<number>`COALESCE(SUM(${estimateExecutionRows.plannedSum}), 0)`,
                })
                .from(estimateExecutionRows)
                .innerJoin(estimates, eq(estimates.id, estimateExecutionRows.estimateId))
                .where(
                    and(
                        eq(estimates.projectId, projectId),
                        inArray(estimates.status, ESTIMATE_VISIBLE_STATUSES),
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
                        eq(estimates.projectId, projectId),
                        inArray(estimates.status, ESTIMATE_VISIBLE_STATUSES),
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
                        eq(estimates.projectId, projectId),
                        inArray(estimates.status, ESTIMATE_VISIBLE_STATUSES),
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
                        eq(globalPurchases.projectId, projectId),
                        withActiveTenant(globalPurchases, teamId),
                        exists(
                            db
                                .select({ id: estimates.id })
                                .from(estimates)
                                .where(
                                    and(
                                        eq(estimates.projectId, projectId),
                                        inArray(estimates.status, ESTIMATE_VISIBLE_STATUSES),
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
            receiptsFactRows,
            executionPlanRows,
            executionFactRows,
            procurementPlanRows,
            procurementFactRows,
        );
    }
}
