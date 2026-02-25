import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/lib/data/db/drizzle';
import { estimateRows, estimates, globalPurchases, materials, projects, teams } from '@/lib/data/db/schema';
import { resetDatabase } from '@/lib/data/db/test-utils';
import { EstimateProcurementService } from '@/lib/services/estimate-procurement.service';

describe('EstimateProcurementService integration', () => {
    let teamA: number;
    let teamB: number;
    let estimateId: string;

    beforeEach(async () => {
        await resetDatabase();

        await db.insert(teams).values({ name: 'System Team' }).returning();
        const [a] = await db.insert(teams).values({ name: 'Team A' }).returning();
        const [b] = await db.insert(teams).values({ name: 'Team B' }).returning();
        teamA = a.id;
        teamB = b.id;

        const [projectA] = await db.insert(projects).values({
            tenantId: teamA,
            name: 'Project A',
            slug: 'project-a',
        }).returning();


        const [projectB] = await db.insert(projects).values({
            tenantId: teamA,
            name: 'Project B',
            slug: 'project-b',
        }).returning();

        const [projectOtherTenant] = await db.insert(projects).values({
            tenantId: teamB,
            name: 'Project Other Tenant',
            slug: 'project-other-tenant',
        }).returning();

        const [estimate] = await db.insert(estimates).values({
            tenantId: teamA,
            projectId: projectA.id,
            name: 'Estimate A',
            slug: 'estimate-a',
        }).returning();

        estimateId = estimate.id;


        const [catalogMaterial] = await db.insert(materials).values({
            tenantId: teamA,
            code: 'MAT-001',
            name: 'Штукатурка гипсовая',
            nameNorm: 'штукатурка гипсовая',
            unit: 'меш',
            price: 500,
            status: 'active',
        }).returning();

        await db.insert(estimateRows).values([
            {
                tenantId: teamA,
                estimateId: estimate.id,
                kind: 'material',
                code: '1.1',
                name: 'Штукатурка (выравнивание)',
                materialId: catalogMaterial.id,
                unit: 'меш',
                qty: 60,
                price: 500,
                sum: 30000,
                expense: 0,
                order: 1,
            },
            {
                tenantId: teamA,
                estimateId: estimate.id,
                kind: 'material',
                code: '2.1',
                name: 'Штукатурка',
                materialId: catalogMaterial.id,
                unit: 'меш',
                qty: 40,
                price: 500,
                sum: 20000,
                expense: 0,
                order: 2,
            },
            {
                tenantId: teamA,
                estimateId: estimate.id,
                kind: 'material',
                code: '3.1',
                name: '  Краска фасадная  ',
                unit: 'л',
                qty: 20,
                price: 250,
                sum: 5000,
                expense: 0,
                order: 3,
            },
        ]);

        await db.insert(globalPurchases).values([
            {
                tenantId: teamA,
                projectId: projectA.id,
                projectName: 'Project A',
                materialName: 'Гипсовая штукатурка Knauf',
                materialId: catalogMaterial.id,
                unit: 'меш',
                qty: 20,
                price: 100,
                amount: 2000,
                note: '',
                source: 'manual',
                order: 1,
                purchaseDate: '2026-01-10',
            },
            {
                tenantId: teamA,
                projectId: projectA.id,
                projectName: 'Project A',
                materialName: 'Штукатурка',
                materialId: catalogMaterial.id,
                unit: 'меш',
                qty: 80,
                price: 120,
                amount: 9600,
                note: '',
                source: 'manual',
                order: 2,
                purchaseDate: '2026-01-11',
            },
            {
                tenantId: teamA,
                projectId: projectA.id,
                projectName: 'Project A',
                materialName: 'краска фасадная',
                unit: 'л',
                qty: 12,
                price: 260,
                amount: 3120,
                note: '',
                source: 'manual',
                order: 3,
                purchaseDate: '2026-01-11',
            },
            {
                tenantId: teamA,
                projectId: projectA.id,
                projectName: 'Project A',
                materialName: 'Краска',
                unit: 'л',
                qty: 10,
                price: 300,
                amount: 3000,
                note: '',
                source: 'manual',
                order: 4,
                purchaseDate: '2026-01-11',
            },
            {
                tenantId: teamA,
                projectId: projectB.id,
                projectName: 'Project B',
                materialName: 'Штукатурка',
                unit: 'меш',
                qty: 999,
                price: 1,
                amount: 999,
                note: '',
                source: 'manual',
                order: 1,
                purchaseDate: '2026-01-11',
            },
            {
                tenantId: teamB,
                projectId: projectOtherTenant.id,
                projectName: 'Project Other Tenant',
                materialName: 'Штукатурка',
                unit: 'меш',
                qty: 999,
                price: 1,
                amount: 999,
                note: '',
                source: 'manual',
                order: 1,
                purchaseDate: '2026-01-11',
            },
        ]);
    });

    it('returns estimate rows + fact_only rows scoped by tenant and estimate project', async () => {
        const result = await EstimateProcurementService.list(teamA, estimateId);

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.data).toHaveLength(3);

        const plaster = result.data.find((row) => row.materialName === 'Штукатурка');
        const paint = result.data.find((row) => row.materialName === 'Краска');
        const facadePaint = result.data.find((row) => row.materialName === 'Краска фасадная');

        expect(plaster).toMatchObject({
            source: 'estimate',
            plannedQty: 100,
            plannedAmount: 50000,
            actualQty: 100,
            actualAmount: 11600,
            actualAvgPrice: 116,
            qtyDelta: 0,
            amountDelta: 38400,
            purchaseCount: 2,
            lastPurchaseDate: '2026-01-11',
        });

        expect(paint).toMatchObject({
            source: 'fact_only',
            plannedQty: 0,
            actualQty: 10,
            qtyDelta: -10,
            amountDelta: -3000,
        });

        expect(facadePaint).toMatchObject({
            source: 'estimate',
            plannedQty: 20,
            plannedAmount: 5000,
            actualQty: 12,
            actualAmount: 3120,
            qtyDelta: 8,
            amountDelta: 1880,
        });
    });

    it('returns NOT_FOUND when estimate does not belong to tenant', async () => {
        const result = await EstimateProcurementService.list(teamB, estimateId);
        expect(result.success).toBe(false);
        if (result.success) return;

        expect(result.error.code).toBe('NOT_FOUND');
    });
});
