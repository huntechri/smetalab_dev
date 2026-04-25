import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/lib/data/db/drizzle';
import { estimateRows, estimates, globalPurchases, projects, teams, estimateProcurementCache } from '@/lib/data/db/schema';
import { resetDatabase } from '@/lib/data/db/test-utils';
import { EstimateProcurementService } from '@/lib/services/estimate-procurement.service';
import { eq } from 'drizzle-orm';

describe('EstimateProcurementService caching', () => {
    let teamId: number;
    let estimateId: string;
    let projectId: string;

    beforeEach(async () => {
        await resetDatabase();

        const [team] = await db.insert(teams).values({ name: 'Test Team' }).returning();
        teamId = team.id;

        const [project] = await db.insert(projects).values({
            tenantId: teamId,
            name: 'Test Project',
            slug: 'test-project',
        }).returning();
        projectId = project.id;

        const [estimate] = await db.insert(estimates).values({
            tenantId: teamId,
            projectId: projectId,
            name: 'Test Estimate',
            slug: 'test-estimate',
        }).returning();
        estimateId = estimate.id;
    });

    it('refreshes cache when estimate rows change', async () => {
        // 1. Initial state: no rows
        let result = await EstimateProcurementService.list(teamId, estimateId);
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(0);

        // 2. Add estimate row
        await db.insert(estimateRows).values({
            tenantId: teamId,
            estimateId,
            kind: 'material',
            code: '1',
            name: 'Material 1',
            unit: 'pc',
            qty: 10,
            price: 100,
            sum: 1000,
            expense: 0,
            order: 1,
        });

        // 3. List again - should refresh and show 1 row
        result = await EstimateProcurementService.list(teamId, estimateId);
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].materialName).toBe('Material 1');

        // 4. Record cache state
        const cacheBefore = await db.select().from(estimateProcurementCache).where(eq(estimateProcurementCache.estimateId, estimateId));
        const refreshedAtBefore = cacheBefore[0].refreshedAt;
        expect(refreshedAtBefore).toBeDefined();

        // 5. Update estimate row (wait a bit to ensure timestamp differs if needed, though most DBs have high precision)
        // In tests, we might need to manually nudge updatedAt if it's too fast
        await new Promise(resolve => setTimeout(resolve, 10)); 
        
        await db.update(estimateRows)
            .set({ qty: 20, sum: 2000, updatedAt: new Date() })
            .where(eq(estimateRows.estimateId, estimateId));

        // 6. List again - should refresh
        result = await EstimateProcurementService.list(teamId, estimateId);
        expect(result.success).toBe(true);
        expect(result.data[0].plannedQty).toBe(20);

        const cacheAfter = await db.select().from(estimateProcurementCache).where(eq(estimateProcurementCache.estimateId, estimateId));
        const refreshedAtAfter = cacheAfter[0].refreshedAt;
        
        expect(refreshedAtAfter! > refreshedAtBefore!).toBe(true);
    });

    it('refreshes cache when global purchases change', async () => {
        // 1. Initial state with estimate row
        await db.insert(estimateRows).values({
            tenantId: teamId,
            estimateId,
            kind: 'material',
            code: '1',
            name: 'Material 1',
            unit: 'pc',
            qty: 10,
            price: 100,
            sum: 1000,
            expense: 0,
            order: 1,
        });
        
        await EstimateProcurementService.list(teamId, estimateId);
        
        const cacheBefore = await db.select().from(estimateProcurementCache).where(eq(estimateProcurementCache.estimateId, estimateId));
        const refreshedAtBefore = cacheBefore[0].refreshedAt;

        // 2. Add purchase
        await new Promise(resolve => setTimeout(resolve, 10));
        await db.insert(globalPurchases).values({
            tenantId: teamId,
            projectId,
            projectName: 'Test Project',
            materialName: 'Material 1',
            unit: 'pc',
            qty: 5,
            price: 100,
            amount: 500,
            note: '',
            source: 'manual',
            order: 1,
            purchaseDate: '2026-01-01',
            updatedAt: new Date(),
        });

        // 3. List again - should refresh
        const result = await EstimateProcurementService.list(teamId, estimateId);
        expect(result.success).toBe(true);
        expect(result.data[0].actualQty).toBe(5);

        const cacheAfter = await db.select().from(estimateProcurementCache).where(eq(estimateProcurementCache.estimateId, estimateId));
        const refreshedAtAfter = cacheAfter[0].refreshedAt;
        
        expect(refreshedAtAfter! > refreshedAtBefore!).toBe(true);
    });
});
