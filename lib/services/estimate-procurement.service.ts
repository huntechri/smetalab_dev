import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/data/db/drizzle';
import { withActiveTenant } from '@/lib/data/db/queries';
import { estimateProcurementCache, estimateRows, estimates, globalPurchases } from '@/lib/data/db/schema';
import { error, Result, success } from '@/lib/utils/result';

export type EstimateProcurementRow = {
    materialName: string;
    unit: string;
    source: 'estimate' | 'fact_only';
    plannedQty: number;
    plannedPrice: number;
    plannedAmount: number;
    actualQty: number;
    actualAvgPrice: number;
    actualAmount: number;
    qtyDelta: number;
    amountDelta: number;
    purchaseCount: number;
    lastPurchaseDate: string | null;
};

type PlanRow = {
    name: string;
    materialId: string | null;
    unit: string;
    qty: number;
    price: number;
};

type FactRow = {
    materialName: string;
    materialId: string | null;
    unit: string;
    qty: number;
    price: number;
    purchaseDate: string;
};

type Aggregate = {
    materialName: string;
    materialId: string | null;
    unit: string;
    qty: number;
    amount: number;
    purchaseCount: number;
    lastPurchaseDate: string | null;
};

type PlanAggregateInput = {
    matchKey: string;
    materialName: string;
    unit: string;
    plannedQty: number;
    plannedAmount: number;
};

type FactAggregateInput = {
    matchKey: string;
    materialName: string;
    unit: string;
    actualQty: number;
    actualAmount: number;
    purchaseCount: number;
    lastPurchaseDate: string | null;
};

type CacheAggregateRow = EstimateProcurementRow & {
    matchKey: string;
};

const normalizeMaterialKey = (name: string) => name.trim().toLocaleLowerCase('ru-RU');
const buildMatchKey = (materialId: string | null, name: string) => materialId ? `id:${materialId}` : `name:${normalizeMaterialKey(name)}`;

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const aggregatePlan = (rows: PlanRow[]) => {
    const map = new Map<string, Aggregate>();

    for (const row of rows) {
        const key = buildMatchKey(row.materialId, row.name);
        if (!key || key === 'name:') continue;

        const current = map.get(key) ?? {
            materialName: row.name.trim(),
            materialId: row.materialId,
            unit: row.unit,
            qty: 0,
            amount: 0,
            purchaseCount: 0,
            lastPurchaseDate: null,
        };

        current.qty += row.qty;
        current.amount += row.qty * row.price;
        if (!current.unit && row.unit) current.unit = row.unit;

        map.set(key, current);
    }

    return map;
};

const aggregateFact = (rows: FactRow[]) => {
    const map = new Map<string, Aggregate>();

    for (const row of rows) {
        const key = buildMatchKey(row.materialId, row.materialName);
        if (!key || key === 'name:') continue;

        const current = map.get(key) ?? {
            materialName: row.materialName.trim(),
            materialId: row.materialId,
            unit: row.unit,
            qty: 0,
            amount: 0,
            purchaseCount: 0,
            lastPurchaseDate: null,
        };

        current.qty += row.qty;
        current.amount += row.qty * row.price;
        current.purchaseCount += 1;
        current.lastPurchaseDate = !current.lastPurchaseDate || row.purchaseDate > current.lastPurchaseDate
            ? row.purchaseDate
            : current.lastPurchaseDate;
        if (!current.unit && row.unit) current.unit = row.unit;

        map.set(key, current);
    }

    return map;
};

const buildRowsFromAggregates = (
    planAggregates: PlanAggregateInput[],
    factAggregates: FactAggregateInput[],
): EstimateProcurementRow[] => {
    const planMap = new Map(planAggregates.map((row) => [row.matchKey, row]));
    const factMap = new Map(factAggregates.map((row) => [row.matchKey, row]));

    const rows: EstimateProcurementRow[] = [];

    for (const [key, plan] of planMap.entries()) {
        const fact = factMap.get(key);

        const plannedQty = plan.plannedQty;
        const plannedAmount = roundMoney(plan.plannedAmount);
        const plannedPrice = plannedQty > 0 ? roundMoney(plannedAmount / plannedQty) : 0;

        const actualQty = fact?.actualQty ?? 0;
        const actualAmount = roundMoney(fact?.actualAmount ?? 0);
        const actualAvgPrice = actualQty > 0 ? roundMoney(actualAmount / actualQty) : 0;

        rows.push({
            materialName: plan.materialName,
            unit: plan.unit || fact?.unit || 'шт',
            source: 'estimate',
            plannedQty: roundMoney(plannedQty),
            plannedPrice,
            plannedAmount,
            actualQty: roundMoney(actualQty),
            actualAvgPrice,
            actualAmount,
            qtyDelta: roundMoney(plannedQty - actualQty),
            amountDelta: roundMoney(plannedAmount - actualAmount),
            purchaseCount: fact?.purchaseCount ?? 0,
            lastPurchaseDate: fact?.lastPurchaseDate ?? null,
        });

        factMap.delete(key);
    }

    for (const fact of factMap.values()) {
        const actualQty = fact.actualQty;
        const actualAmount = roundMoney(fact.actualAmount);
        const actualAvgPrice = actualQty > 0 ? roundMoney(actualAmount / actualQty) : 0;

        rows.push({
            materialName: fact.materialName,
            unit: fact.unit || 'шт',
            source: 'fact_only',
            plannedQty: 0,
            plannedPrice: 0,
            plannedAmount: 0,
            actualQty: roundMoney(actualQty),
            actualAvgPrice,
            actualAmount,
            qtyDelta: roundMoney(-actualQty),
            amountDelta: roundMoney(-actualAmount),
            purchaseCount: fact.purchaseCount,
            lastPurchaseDate: fact.lastPurchaseDate,
        });
    }

    return rows.sort((a, b) => {
        if (a.source !== b.source) return a.source === 'estimate' ? -1 : 1;
        return a.materialName.localeCompare(b.materialName, 'ru-RU');
    });
};

const buildCacheRowsFromAggregates = (
    planAggregates: PlanAggregateInput[],
    factAggregates: FactAggregateInput[],
): CacheAggregateRow[] => {
    const planMap = new Map(planAggregates.map((row) => [row.matchKey, row]));
    const factMap = new Map(factAggregates.map((row) => [row.matchKey, row]));

    const rows: CacheAggregateRow[] = [];

    for (const [matchKey, plan] of planMap.entries()) {
        const fact = factMap.get(matchKey);
        const plannedAmount = roundMoney(plan.plannedAmount);
        const plannedQty = roundMoney(plan.plannedQty);
        const actualAmount = roundMoney(fact?.actualAmount ?? 0);
        const actualQty = roundMoney(fact?.actualQty ?? 0);

        rows.push({
            matchKey,
            materialName: plan.materialName,
            unit: plan.unit || fact?.unit || 'шт',
            source: 'estimate',
            plannedQty,
            plannedPrice: plannedQty > 0 ? roundMoney(plannedAmount / plannedQty) : 0,
            plannedAmount,
            actualQty,
            actualAvgPrice: actualQty > 0 ? roundMoney(actualAmount / actualQty) : 0,
            actualAmount,
            qtyDelta: roundMoney(plannedQty - actualQty),
            amountDelta: roundMoney(plannedAmount - actualAmount),
            purchaseCount: fact?.purchaseCount ?? 0,
            lastPurchaseDate: fact?.lastPurchaseDate ?? null,
        });

        factMap.delete(matchKey);
    }

    for (const [matchKey, fact] of factMap.entries()) {
        const actualAmount = roundMoney(fact.actualAmount);
        const actualQty = roundMoney(fact.actualQty);

        rows.push({
            matchKey,
            materialName: fact.materialName,
            unit: fact.unit || 'шт',
            source: 'fact_only',
            plannedQty: 0,
            plannedPrice: 0,
            plannedAmount: 0,
            actualQty,
            actualAvgPrice: actualQty > 0 ? roundMoney(actualAmount / actualQty) : 0,
            actualAmount,
            qtyDelta: roundMoney(-actualQty),
            amountDelta: roundMoney(-actualAmount),
            purchaseCount: fact.purchaseCount,
            lastPurchaseDate: fact.lastPurchaseDate,
        });
    }

    return rows;
};

export const buildEstimateProcurementRows = (planRows: PlanRow[], factRows: FactRow[]): EstimateProcurementRow[] => {
    const planMap = aggregatePlan(planRows);
    const factMap = aggregateFact(factRows);

    return buildRowsFromAggregates(
        [...planMap.entries()].map(([matchKey, row]) => ({
            matchKey,
            materialName: row.materialName,
            unit: row.unit,
            plannedQty: row.qty,
            plannedAmount: row.amount,
        })),
        [...factMap.entries()].map(([matchKey, row]) => ({
            matchKey,
            materialName: row.materialName,
            unit: row.unit,
            actualQty: row.qty,
            actualAmount: row.amount,
            purchaseCount: row.purchaseCount,
            lastPurchaseDate: row.lastPurchaseDate,
        })),
    );
};

export function shouldRefreshProcurementCache(params: {
    cacheHasRows: boolean;
    maxRefreshedAt: Date | null;
    latestSourceAt: Date | null;
}): boolean {
    const { cacheHasRows, maxRefreshedAt, latestSourceAt } = params;

    // PERF+CORRECTNESS: if all source rows are gone, refresh only when stale cache rows still exist.
    if (!latestSourceAt) {
        return cacheHasRows;
    }

    if (!maxRefreshedAt) {
        return true;
    }

    return latestSourceAt > maxRefreshedAt;
}

const toDateOrNull = (value: unknown): Date | null => {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

    if (typeof value === 'string' || typeof value === 'number') {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
};

export class EstimateProcurementService {
    private static async shouldRefreshCache(teamId: number, estimateId: string, projectId: string) {
        const [cacheState] = await db
            .select({
                maxRefreshedAt: sql<Date | null>`MAX(${estimateProcurementCache.refreshedAt})`,
                rowsCount: sql<number>`COUNT(*)::int`,
            })
            .from(estimateProcurementCache)
            .where(
                and(
                    eq(estimateProcurementCache.estimateId, estimateId),
                    withActiveTenant(estimateProcurementCache, teamId),
                ),
            );

        const [planState, factState] = await Promise.all([
            db
                .select({ maxUpdatedAt: sql<Date | null>`MAX(${estimateRows.updatedAt})` })
                .from(estimateRows)
                .where(
                    and(
                        eq(estimateRows.estimateId, estimateId),
                        eq(estimateRows.kind, 'material'),
                        withActiveTenant(estimateRows, teamId),
                    ),
                ),
            db
                .select({ maxUpdatedAt: sql<Date | null>`MAX(${globalPurchases.updatedAt})` })
                .from(globalPurchases)
                .where(
                    and(
                        eq(globalPurchases.projectId, projectId),
                        withActiveTenant(globalPurchases, teamId),
                    ),
                ),
        ]);

        const latestSourceAt = [planState[0]?.maxUpdatedAt, factState[0]?.maxUpdatedAt]
            .map((value) => toDateOrNull(value))
            .filter((value): value is Date => value instanceof Date)
            .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

        return shouldRefreshProcurementCache({
            cacheHasRows: Number(cacheState?.rowsCount ?? 0) > 0,
            maxRefreshedAt: toDateOrNull(cacheState?.maxRefreshedAt),
            latestSourceAt,
        });
    }

    private static async refreshCache(teamId: number, estimateId: string, projectId: string) {
        const [planAggregates, factAggregates] = await Promise.all([
            db
                .select({
                    matchKey: estimateRows.matchKey,
                    materialName: sql<string>`MIN(trim(${estimateRows.name}))`,
                    unit: sql<string>`MIN(${estimateRows.unit})`,
                    plannedQty: sql<number>`COALESCE(SUM(${estimateRows.qty}), 0)`,
                    plannedAmount: sql<number>`COALESCE(SUM(${estimateRows.qty} * ${estimateRows.price}), 0)`,
                })
                .from(estimateRows)
                .where(
                    and(
                        eq(estimateRows.estimateId, estimateId),
                        eq(estimateRows.kind, 'material'),
                        withActiveTenant(estimateRows, teamId),
                    ),
                )
                .groupBy(estimateRows.matchKey),
            db
                .select({
                    matchKey: globalPurchases.matchKey,
                    materialName: sql<string>`MIN(trim(${globalPurchases.materialName}))`,
                    unit: sql<string>`MIN(${globalPurchases.unit})`,
                    actualQty: sql<number>`COALESCE(SUM(${globalPurchases.qty}), 0)`,
                    actualAmount: sql<number>`COALESCE(SUM(${globalPurchases.qty} * ${globalPurchases.price}), 0)`,
                    purchaseCount: sql<number>`COUNT(*)::int`,
                    lastPurchaseDate: sql<string | null>`MAX(${globalPurchases.purchaseDate})`,
                })
                .from(globalPurchases)
                .where(
                    and(
                        eq(globalPurchases.projectId, projectId),
                        withActiveTenant(globalPurchases, teamId),
                    ),
                )
                .groupBy(globalPurchases.matchKey),
        ]);

        const rows = buildCacheRowsFromAggregates(planAggregates, factAggregates);

        await db.transaction(async (tx) => {
            await tx
                .update(estimateProcurementCache)
                .set({ deletedAt: sql`NOW()` })
                .where(
                    and(
                        eq(estimateProcurementCache.estimateId, estimateId),
                        withActiveTenant(estimateProcurementCache, teamId),
                    ),
                );

            if (rows.length === 0) return;

            await tx
                .insert(estimateProcurementCache)
                .values(rows.map((row) => ({
                    tenantId: teamId,
                    estimateId,
                    projectId,
                    matchKey: row.matchKey,
                    materialName: row.materialName,
                    unit: row.unit,
                    source: row.source,
                    plannedQty: row.plannedQty,
                    plannedPrice: row.plannedPrice,
                    plannedAmount: row.plannedAmount,
                    actualQty: row.actualQty,
                    actualAvgPrice: row.actualAvgPrice,
                    actualAmount: row.actualAmount,
                    qtyDelta: row.qtyDelta,
                    amountDelta: row.amountDelta,
                    purchaseCount: row.purchaseCount,
                    lastPurchaseDate: row.lastPurchaseDate,
                })))
                // CORRECTNESS: unique key ignores deleted_at, so upsert reuses soft-deleted cache rows.
                .onConflictDoUpdate({
                    target: [estimateProcurementCache.tenantId, estimateProcurementCache.estimateId, estimateProcurementCache.matchKey],
                    set: {
                        projectId: sql`excluded.project_id`,
                        materialName: sql`excluded.material_name`,
                        unit: sql`excluded.unit`,
                        source: sql`excluded.source`,
                        plannedQty: sql`excluded.planned_qty`,
                        plannedPrice: sql`excluded.planned_price`,
                        plannedAmount: sql`excluded.planned_amount`,
                        actualQty: sql`excluded.actual_qty`,
                        actualAvgPrice: sql`excluded.actual_avg_price`,
                        actualAmount: sql`excluded.actual_amount`,
                        qtyDelta: sql`excluded.qty_delta`,
                        amountDelta: sql`excluded.amount_delta`,
                        purchaseCount: sql`excluded.purchase_count`,
                        lastPurchaseDate: sql`excluded.last_purchase_date`,
                        refreshedAt: sql`now()`,
                        updatedAt: sql`now()`,
                        deletedAt: null,
                    },
                });
        });
    }

    static async list(teamId: number, estimateId: string): Promise<Result<EstimateProcurementRow[]>> {
        try {
            const estimate = await db.query.estimates.findFirst({
                where: and(eq(estimates.id, estimateId), withActiveTenant(estimates, teamId)),
                columns: { id: true, projectId: true },
            });

            if (!estimate) return error('Смета не найдена', 'NOT_FOUND');

            if (await this.shouldRefreshCache(teamId, estimateId, estimate.projectId)) {
                await this.refreshCache(teamId, estimateId, estimate.projectId);
            }

            const cacheRows = await db
                .select({
                    materialName: estimateProcurementCache.materialName,
                    unit: estimateProcurementCache.unit,
                    source: sql<'estimate' | 'fact_only'>`${estimateProcurementCache.source}`,
                    plannedQty: estimateProcurementCache.plannedQty,
                    plannedPrice: estimateProcurementCache.plannedPrice,
                    plannedAmount: estimateProcurementCache.plannedAmount,
                    actualQty: estimateProcurementCache.actualQty,
                    actualAvgPrice: estimateProcurementCache.actualAvgPrice,
                    actualAmount: estimateProcurementCache.actualAmount,
                    qtyDelta: estimateProcurementCache.qtyDelta,
                    amountDelta: estimateProcurementCache.amountDelta,
                    purchaseCount: estimateProcurementCache.purchaseCount,
                    lastPurchaseDate: estimateProcurementCache.lastPurchaseDate,
                })
                .from(estimateProcurementCache)
                .where(
                    and(
                        eq(estimateProcurementCache.estimateId, estimateId),
                        withActiveTenant(estimateProcurementCache, teamId),
                    ),
                );

            return success(cacheRows.sort((a, b) => {
                if (a.source !== b.source) return a.source === 'estimate' ? -1 : 1;
                return a.materialName.localeCompare(b.materialName, 'ru-RU');
            }));
        } catch (serviceError) {
            console.error('EstimateProcurementService.list error:', serviceError);
            return error('Ошибка загрузки закупок сметы');
        }
    }
}
