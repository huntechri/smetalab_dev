import dotenv from 'dotenv';
import { performance } from 'node:perf_hooks';

import { and, eq, isNull, sql } from 'drizzle-orm';

import { db } from '../lib/data/db/drizzle.node';
import { estimateProcurementCache, estimateRows, estimates, globalPurchases } from '../lib/data/db/schema';

dotenv.config();

type Target = {
    estimateId: string;
    tenantId: number;
    projectId: string;
    totalRows: number;
};

async function findHeavyEstimates(): Promise<Target[]> {
    const candidates = await db
        .select({
            estimateId: estimates.id,
            tenantId: estimates.tenantId,
            projectId: estimates.projectId,
        })
        .from(estimates)
        .where(isNull(estimates.deletedAt))
        .limit(100);

    const withCounts = await Promise.all(candidates.map(async (row) => {
        const [estimateRowsCount] = await db.select({
            count: sql<number>`COUNT(*)::int`,
        })
            .from(estimateRows)
            .where(and(
                eq(estimateRows.tenantId, row.tenantId),
                eq(estimateRows.estimateId, row.estimateId),
                eq(estimateRows.kind, 'material'),
                isNull(estimateRows.deletedAt),
            ));

        const [purchasesCount] = await db.select({
            count: sql<number>`COUNT(*)::int`,
        })
            .from(globalPurchases)
            .where(and(
                eq(globalPurchases.tenantId, row.tenantId),
                eq(globalPurchases.projectId, row.projectId),
                isNull(globalPurchases.deletedAt),
            ));

        return {
            ...row,
            totalRows: estimateRowsCount.count + purchasesCount.count,
        };
    }));

    return withCounts
        .filter((row) => row.totalRows >= 50_000)
        .sort((a, b) => b.totalRows - a.totalRows)
        .slice(0, 5);
}

async function runLiveAggregation(target: Target) {
    await Promise.all([
        db
            .select({
                matchKey: estimateRows.matchKey,
                plannedQty: sql<number>`COALESCE(SUM(${estimateRows.qty}), 0)`,
                plannedAmount: sql<number>`COALESCE(SUM(${estimateRows.qty} * ${estimateRows.price}), 0)`,
            })
            .from(estimateRows)
            .where(
                and(
                    eq(estimateRows.tenantId, target.tenantId),
                    eq(estimateRows.estimateId, target.estimateId),
                    eq(estimateRows.kind, 'material'),
                    isNull(estimateRows.deletedAt),
                ),
            )
            .groupBy(estimateRows.matchKey),
        db
            .select({
                matchKey: globalPurchases.matchKey,
                actualQty: sql<number>`COALESCE(SUM(${globalPurchases.qty}), 0)`,
                actualAmount: sql<number>`COALESCE(SUM(${globalPurchases.qty} * ${globalPurchases.price}), 0)`,
            })
            .from(globalPurchases)
            .where(
                and(
                    eq(globalPurchases.tenantId, target.tenantId),
                    eq(globalPurchases.projectId, target.projectId),
                    isNull(globalPurchases.deletedAt),
                ),
            )
            .groupBy(globalPurchases.matchKey),
    ]);
}

async function runCacheRead(target: Target) {
    await db
        .select({ id: estimateProcurementCache.id })
        .from(estimateProcurementCache)
        .where(
            and(
                eq(estimateProcurementCache.tenantId, target.tenantId),
                eq(estimateProcurementCache.estimateId, target.estimateId),
                isNull(estimateProcurementCache.deletedAt),
            ),
        );
}

async function benchmarkEstimateProcurement() {
    console.log('--- Estimate Procurement Benchmark (50k+ rows) ---');

    const heavy = await findHeavyEstimates();

    if (heavy.length === 0) {
        console.warn('No estimates with 50k+ material rows + purchases were found.');
        return;
    }

    for (const target of heavy) {
        const iterations = 5;
        const liveLatencies: number[] = [];
        const cacheLatencies: number[] = [];

        for (let i = 0; i < iterations; i += 1) {
            let start = performance.now();
            await runLiveAggregation(target);
            liveLatencies.push(performance.now() - start);

            start = performance.now();
            await runCacheRead(target);
            cacheLatencies.push(performance.now() - start);
        }

        const sortAsc = (values: number[]) => [...values].sort((a, b) => a - b);
        const liveSorted = sortAsc(liveLatencies);
        const cacheSorted = sortAsc(cacheLatencies);
        const pick = (values: number[], p: number) => values[Math.floor(values.length * p)];

        console.log(`estimate=${target.estimateId} totalRows=${target.totalRows}`);
        console.log(`  live  p50=${pick(liveSorted, 0.5).toFixed(2)}ms p95=${pick(liveSorted, 0.95).toFixed(2)}ms`);
        console.log(`  cache p50=${pick(cacheSorted, 0.5).toFixed(2)}ms p95=${pick(cacheSorted, 0.95).toFixed(2)}ms`);
    }
}

benchmarkEstimateProcurement()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Benchmark failed:', err);
        process.exit(1);
    });
