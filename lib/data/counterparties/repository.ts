import { db } from '@/lib/data/db/drizzle';
import { activityLogs, counterparties } from '@/lib/data/db/schema';
import { eq } from 'drizzle-orm';

interface CounterpartyPayload {
  [key: string]: string | null | undefined;
  name: string;
  type: 'customer' | 'contractor' | 'supplier';
  legalStatus: 'individual' | 'company';
}

export async function createCounterpartyRecord(teamId: number, userId: number, data: CounterpartyPayload) {
  return db.transaction(async (tx) => {
    const [newRow] = await tx.insert(counterparties).values({ ...data, tenantId: teamId }).returning();
    await tx.insert(activityLogs).values({ teamId, userId, action: `Created counterparty: ${newRow.name}` });
    return newRow;
  });
}

export async function updateCounterpartyRecord(teamId: number, userId: number, id: string, data: CounterpartyPayload) {
  return db.transaction(async (tx) => {
    const [updatedRow] = await tx.update(counterparties).set({ ...data, updatedAt: new Date() }).where(eq(counterparties.id, id)).returning();
    if (!updatedRow) throw new Error(`Counterparty not found or update denied: ${id}`);
    await tx.insert(activityLogs).values({ teamId, userId, action: `Updated counterparty: ${updatedRow.name} (ID: ${id})` });
    return updatedRow;
  });
}

export async function deleteCounterpartyRecord(teamId: number, userId: number, id: string) {
  return db.transaction(async (tx) => {
    await tx.update(counterparties).set({ deletedAt: new Date() }).where(eq(counterparties.id, id));
    await tx.insert(activityLogs).values({ teamId, userId, action: `Deleted counterparty (soft-delete) with ID: ${id}` });
  });
}
