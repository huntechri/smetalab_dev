import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/data/db/drizzle';
import { withActiveTenant } from '@/lib/data/db/queries';
import { estimateRows, estimates, globalPurchases } from '@/lib/data/db/schema';
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
    unit: string;
    qty: number;
    price: number;
};

type FactRow = {
    materialName: string;
    unit: string;
    qty: number;
    price: number;
    purchaseDate: string;
};

type Aggregate = {
    materialName: string;
    unit: string;
    qty: number;
    amount: number;
    purchaseCount: number;
    lastPurchaseDate: string | null;
};

type PlanAggregateInput = {
    materialName: string;
    unit: string;
    plannedQty: number;
    plannedAmount: number;
};

type FactAggregateInput = {
    materialName: string;
    unit: string;
    actualQty: number;
    actualAmount: number;
    purchaseCount: number;
    lastPurchaseDate: string | null;
};

const normalizeMaterialKey = (name: string) => name.trim().toLocaleLowerCase('ru-RU');

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const aggregatePlan = (rows: PlanRow[]) => {
    const map = new Map<string, Aggregate>();

    for (const row of rows) {
        const key = normalizeMaterialKey(row.name);
        if (!key) continue;

        const current = map.get(key) ?? {
            materialName: row.name.trim(),
            unit: row.unit,
            qty: 0,
            amount: 0,
            purchaseCount: 0,
            lastPurchaseDate: null,
        };

        current.qty += row.qty;
        current.amount += row.qty * row.price;
        if (!current.unit && row.unit) {
            current.unit = row.unit;
        }

        map.set(key, current);
    }

    return map;
};

const aggregateFact = (rows: FactRow[]) => {
    const map = new Map<string, Aggregate>();

    for (const row of rows) {
        const key = normalizeMaterialKey(row.materialName);
        if (!key) continue;

        const current = map.get(key) ?? {
            materialName: row.materialName.trim(),
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
        if (!current.unit && row.unit) {
            current.unit = row.unit;
        }

        map.set(key, current);
    }

    return map;
};

const buildRowsFromAggregates = (
    planAggregates: PlanAggregateInput[],
    factAggregates: FactAggregateInput[],
): EstimateProcurementRow[] => {
    const planMap = new Map(planAggregates.map((row) => [normalizeMaterialKey(row.materialName), row]));
    const factMap = new Map(factAggregates.map((row) => [normalizeMaterialKey(row.materialName), row]));

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
        if (a.source !== b.source) {
            return a.source === 'estimate' ? -1 : 1;
        }

        return a.materialName.localeCompare(b.materialName, 'ru-RU');
    });
};

export const buildEstimateProcurementRows = (planRows: PlanRow[], factRows: FactRow[]): EstimateProcurementRow[] => {
    const planMap = aggregatePlan(planRows);
    const factMap = aggregateFact(factRows);

    return buildRowsFromAggregates(
        [...planMap.values()].map((row) => ({
            materialName: row.materialName,
            unit: row.unit,
            plannedQty: row.qty,
            plannedAmount: row.amount,
        })),
        [...factMap.values()].map((row) => ({
            materialName: row.materialName,
            unit: row.unit,
            actualQty: row.qty,
            actualAmount: row.amount,
            purchaseCount: row.purchaseCount,
            lastPurchaseDate: row.lastPurchaseDate,
        })),
    );
};

export class EstimateProcurementService {
    static async list(teamId: number, estimateId: string): Promise<Result<EstimateProcurementRow[]>> {
        try {
            const estimate = await db.query.estimates.findFirst({
                where: and(eq(estimates.id, estimateId), withActiveTenant(estimates, teamId)),
                columns: { id: true, projectId: true },
            });

            if (!estimate) {
                return error('Смета не найдена', 'NOT_FOUND');
            }

            const planNameNormalized = sql<string>`lower(trim(${estimateRows.name}))`;
            const purchaseNameNormalized = sql<string>`lower(trim(${globalPurchases.materialName}))`;

            const [planAggregates, factAggregates] = await Promise.all([
                db
                    .select({
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
                    .groupBy(planNameNormalized),
                db
                    .select({
                        materialName: sql<string>`MIN(trim(${globalPurchases.materialName}))`,
                        unit: sql<string>`MIN(${globalPurchases.unit})`,
                        actualQty: sql<number>`COALESCE(SUM(${globalPurchases.qty}), 0)`,
                        actualAmount: sql<number>`COALESCE(SUM(${globalPurchases.qty} * ${globalPurchases.price}), 0)`,
                        purchaseCount: sql<number>`COUNT(*)`,
                        lastPurchaseDate: sql<string | null>`MAX(${globalPurchases.purchaseDate})`,
                    })
                    .from(globalPurchases)
                    .where(
                        and(
                            eq(globalPurchases.projectId, estimate.projectId),
                            withActiveTenant(globalPurchases, teamId),
                        ),
                    )
                    .groupBy(purchaseNameNormalized),
            ]);

            return success(buildRowsFromAggregates(planAggregates, factAggregates));
        } catch (serviceError) {
            console.error('EstimateProcurementService.list error:', serviceError);
            return error('Ошибка загрузки закупок сметы');
        }
    }
}
