import { db } from '@/lib/data/db/drizzle';
import { activityLogs, globalPurchases, materialSuppliers } from '@/lib/data/db/schema';
import { and, eq } from 'drizzle-orm';
import { withActiveTenant } from '@/lib/data/db/tenant';

interface MaterialSupplierPayload {
  [key: string]: string | null | undefined;
  name: string;
  color: string;
  legalStatus: 'individual' | 'company';
}

export async function createMaterialSupplierRecord(teamId: number, userId: number, data: MaterialSupplierPayload) {
  return db.transaction(async (tx) => {
    const [newRow] = await tx.insert(materialSuppliers).values({ ...data, tenantId: teamId }).returning();
    await tx.insert(activityLogs).values({ teamId, userId, action: `Created material supplier: ${newRow.name}` });
    return newRow;
  });
}

export async function updateMaterialSupplierRecord(teamId: number, userId: number, id: string, data: MaterialSupplierPayload) {
  return db.transaction(async (tx) => {
    const [updatedRow] = await tx
      .update(materialSuppliers)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(materialSuppliers.id, id), withActiveTenant(materialSuppliers, teamId)))
      .returning();

    if (!updatedRow) throw new Error(`Material supplier not found or update denied: ${id}`);

    await tx.insert(activityLogs).values({ teamId, userId, action: `Updated material supplier: ${updatedRow.name} (ID: ${id})` });
    return updatedRow;
  });
}

export async function deleteMaterialSupplierRecord(teamId: number, userId: number, id: string) {
  return db.transaction(async (tx) => {
    await tx
      .update(materialSuppliers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(materialSuppliers.id, id), withActiveTenant(materialSuppliers, teamId)));

    await tx
      .update(globalPurchases)
      .set({ supplierId: null, updatedAt: new Date() })
      .where(and(eq(globalPurchases.supplierId, id), withActiveTenant(globalPurchases, teamId)));

    await tx.insert(activityLogs).values({ teamId, userId, action: `Deleted material supplier (soft-delete) with ID: ${id}` });
  });
}
