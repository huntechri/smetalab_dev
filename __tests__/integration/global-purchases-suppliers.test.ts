import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/data/db/drizzle';
import { globalPurchases, materialSuppliers, teams } from '@/lib/data/db/schema';
import { GlobalPurchasesService } from '@/lib/services/global-purchases.service';
import { eq } from 'drizzle-orm';
import { resetDatabase } from '@/lib/data/db/test-utils';

describe('Global purchases supplier badges integration', () => {
  let teamA: number;
  let teamB: number;
  let purchaseId: string;
  let supplierAId: string;
  let supplierBId: string;

  beforeEach(async () => {
    await resetDatabase();

    const [a] = await db.insert(teams).values({ name: 'Team A' }).returning();
    const [b] = await db.insert(teams).values({ name: 'Team B' }).returning();
    teamA = a.id;
    teamB = b.id;

    const [supplierA] = await db.insert(materialSuppliers).values({
      tenantId: teamA,
      name: 'Supplier A',
      color: '#22C55E',
      legalStatus: 'company',
    }).returning();

    const [supplierB] = await db.insert(materialSuppliers).values({
      tenantId: teamB,
      name: 'Supplier B',
      color: '#EF4444',
      legalStatus: 'company',
    }).returning();

    supplierAId = supplierA.id;
    supplierBId = supplierB.id;

    const [row] = await db.insert(globalPurchases).values({
      tenantId: teamA,
      projectName: '',
      materialName: 'Цемент',
      unit: 'шт',
      qty: 1,
      price: 100,
      amount: 100,
      note: '',
      source: 'manual',
      purchaseDate: '2026-02-01',
      order: 1,
    }).returning();

    purchaseId = row.id;
  });

  it('assigns supplier and returns badge fields in list', async () => {
    const patch = await GlobalPurchasesService.patch(teamA, purchaseId, { supplierId: supplierAId });
    expect(patch.success).toBe(true);

    const list = await GlobalPurchasesService.list(teamA, { from: '2026-02-01', to: '2026-02-01' });
    expect(list.success).toBe(true);
    if (!list.success) return;

    expect(list.data[0].supplierId).toBe(supplierAId);
    expect(list.data[0].supplierName).toBe('Supplier A');
    expect(list.data[0].supplierColor).toBe('#22C55E');
  });

  it('blocks assigning supplier from another tenant', async () => {
    const patch = await GlobalPurchasesService.patch(teamA, purchaseId, { supplierId: supplierBId });
    expect(patch.success).toBe(false);
    if (patch.success) return;
    expect(patch.error.code).toBe('NOT_FOUND');
  });

  it('removes supplier from purchase when supplier is deleted', async () => {
    await GlobalPurchasesService.patch(teamA, purchaseId, { supplierId: supplierAId });

    await db.update(materialSuppliers)
      .set({ deletedAt: new Date() })
      .where(eq(materialSuppliers.id, supplierAId));

    const list = await GlobalPurchasesService.list(teamA, { from: '2026-02-01', to: '2026-02-01' });
    expect(list.success).toBe(true);
    if (!list.success) return;
    expect(list.data[0].supplierName).toBeNull();
    expect(list.data[0].supplierColor).toBeNull();
  });
});
