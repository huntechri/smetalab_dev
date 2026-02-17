import { and, eq } from 'drizzle-orm';
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

export const buildEstimateProcurementRows = (planRows: PlanRow[], factRows: FactRow[]): EstimateProcurementRow[] => {
    const planMap = aggregatePlan(planRows);
    const factMap = aggregateFact(factRows);

    const rows: EstimateProcurementRow[] = [];

    for (const [key, plan] of planMap.entries()) {
        const fact = factMap.get(key);

        const plannedQty = plan.qty;
        const plannedAmount = roundMoney(plan.amount);
        const plannedPrice = plannedQty > 0 ? roundMoney(plannedAmount / plannedQty) : 0;

        const actualQty = fact?.qty ?? 0;
        const actualAmount = roundMoney(fact?.amount ?? 0);
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
        const actualQty = fact.qty;
        const actualAmount = roundMoney(fact.amount);
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

            const [planRows, factRows] = await Promise.all([
                db.query.estimateRows.findMany({
                    where: and(
                        eq(estimateRows.estimateId, estimateId),
                        eq(estimateRows.kind, 'material'),
                        withActiveTenant(estimateRows, teamId),
                    ),
                    columns: { name: true, unit: true, qty: true, price: true },
                }),
                db.query.globalPurchases.findMany({
                    where: and(
                        eq(globalPurchases.projectId, estimate.projectId),
                        withActiveTenant(globalPurchases, teamId),
                    ),
                    columns: { materialName: true, unit: true, qty: true, price: true, purchaseDate: true },
                }),
            ]);

            return success(buildEstimateProcurementRows(planRows, factRows));
        } catch (serviceError) {
            console.error('EstimateProcurementService.list error:', serviceError);
            return error('Ошибка загрузки закупок сметы');
        }
    }
}
