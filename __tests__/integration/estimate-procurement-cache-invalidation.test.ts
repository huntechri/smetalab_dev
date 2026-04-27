import { beforeEach, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/data/db/drizzle';
import { estimateRows, estimates, globalPurchases, projects, teams } from '@/lib/data/db/schema';
import { resetDatabase } from '@/lib/data/db/test-utils';
import { EstimateProcurementService } from '@/lib/services/estimate-procurement.service';

describe('EstimateProcurementService cache invalidation', () => {
    let teamId: number;
    let estimateId: string;
    let purchaseId: string;

    beforeEach(async () => {
        await resetDatabase();

        await db.insert(teams).values({ name: 'System Team' }).returning();
        const [team] = await db.insert(teams).values({ name: 'Team Procurement' }).returning();
        teamId = team.id;

        const [project] = await db.insert(projects).values({
            tenantId: teamId,
            name: 'Procurement Project',
            slug: 'procurement-project',
        }).returning();

        const [estimate] = await db.insert(estimates).values({
            tenantId: teamId,
            projectId: project.id,
            name: 'Procurement Estimate',
            slug: 'procurement-estimate',
        }).returning();
        estimateId = estimate.id;

        await db.insert(estimateRows).values({
            tenantId: teamId,
            estimateId,
            kind: 'material',
            code: '1.1',
            name: 'Штукатурка',
            unit: 'меш',
            qty: 10,
            price: 500,
            sum: 5000,
            expense: 0,
            order: 1,
        });

        const [purchase] = await db.insert(globalPurchases).values({
            tenantId: teamId,
            projectId: project.id,
            projectName: project.name,
            materialName: 'Штукатурка',
            unit: 'меш',
            qty: 4,
            price: 450,
            amount: 1800,
            note: '',
            source: 'manual',
            order: 1,
            purchaseDate: '2026-01-10',
        }).returning();
        purchaseId = purchase.id;
    });

    it('refreshes procurement cache after a global purchase is soft-deleted', async () => {
        const firstResult = await EstimateProcurementService.list(teamId, estimateId);
        expect(firstResult.success).toBe(true);
        if (!firstResult.success) return;

        expect(firstResult.data[0]).toMatchObject({
            materialName: 'Штукатурка',
            plannedQty: 10,
            actualQty: 4,
            actualAmount: 1800,
            purchaseCount: 1,
        });

        await db.update(globalPurchases)
            .set({
                deletedAt: new Date('2030-01-01T00:00:00.000Z'),
                updatedAt: new Date('2030-01-01T00:00:00.000Z'),
            })
            .where(and(eq(globalPurchases.id, purchaseId), eq(globalPurchases.tenantId, teamId)));

        const secondResult = await EstimateProcurementService.list(teamId, estimateId);
        expect(secondResult.success).toBe(true);
        if (!secondResult.success) return;

        expect(secondResult.data).toHaveLength(1);
        expect(secondResult.data[0]).toMatchObject({
            materialName: 'Штукатурка',
            plannedQty: 10,
            actualQty: 0,
            actualAmount: 0,
            purchaseCount: 0,
        });
    });
});
