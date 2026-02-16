import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/data/db/drizzle';
import { withActiveTenant } from '@/lib/data/db/queries';
import { globalPurchases } from '@/lib/data/db/schema';
import { error, Result, success } from '@/lib/utils/result';
import type { PurchaseRow } from '@/features/global-purchases/types/dto';

const nonNegative = z.number().finite().min(0);

const createSchema = z.object({
    projectName: z.string().trim().max(160).default(''),
    materialName: z.string().trim().max(240).default(''),
    unit: z.string().trim().max(20).default('шт'),
    qty: nonNegative.default(1),
    price: nonNegative.default(0),
    note: z.string().trim().max(500).default(''),
    source: z.enum(['manual', 'catalog']).default('manual'),
});

const patchSchema = z.object({
    projectName: z.string().trim().max(160).optional(),
    materialName: z.string().trim().max(240).optional(),
    unit: z.string().trim().max(20).optional(),
    qty: nonNegative.optional(),
    price: nonNegative.optional(),
    note: z.string().trim().max(500).optional(),
});

const calculateAmount = (qty: number, price: number) => Math.round((qty * price + Number.EPSILON) * 100) / 100;

const toRow = (row: typeof globalPurchases.$inferSelect): PurchaseRow => ({
    id: row.id,
    projectName: row.projectName,
    materialName: row.materialName,
    unit: row.unit,
    qty: row.qty,
    price: row.price,
    amount: row.amount,
    note: row.note,
    source: row.source,
});

export class GlobalPurchasesService {
    static async list(teamId: number): Promise<Result<PurchaseRow[]>> {
        try {
            const rows = await db.query.globalPurchases.findMany({
                where: withActiveTenant(globalPurchases, teamId),
                orderBy: [asc(globalPurchases.order), asc(globalPurchases.createdAt)],
            });

            return success(rows.map(toRow));
        } catch (serviceError) {
            console.error('GlobalPurchasesService.list error', serviceError);
            return error('Не удалось загрузить закупки');
        }
    }

    static async create(teamId: number, rawPayload: unknown): Promise<Result<PurchaseRow>> {
        const parsed = createSchema.safeParse(rawPayload);
        if (!parsed.success) {
            return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');
        }

        try {
            const created = await db.transaction(async (tx) => {
                const [{ maxOrder }] = await tx
                    .select({ maxOrder: sql<number>`COALESCE(MAX(${globalPurchases.order}), 0)` })
                    .from(globalPurchases)
                    .where(withActiveTenant(globalPurchases, teamId));

                const payload = parsed.data;
                const [row] = await tx.insert(globalPurchases).values({
                    tenantId: teamId,
                    projectName: payload.projectName,
                    materialName: payload.materialName,
                    unit: payload.unit,
                    qty: payload.qty,
                    price: payload.price,
                    amount: calculateAmount(payload.qty, payload.price),
                    note: payload.note,
                    source: payload.source,
                    order: maxOrder + 1,
                }).returning();

                return row;
            });

            return success(toRow(created));
        } catch (serviceError) {
            console.error('GlobalPurchasesService.create error', serviceError);
            return error('Не удалось создать строку закупки');
        }
    }

    static async patch(teamId: number, rowId: string, rawPatch: unknown): Promise<Result<PurchaseRow>> {
        const parsed = patchSchema.safeParse(rawPatch);
        if (!parsed.success) {
            return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');
        }

        try {
            const existing = await db.query.globalPurchases.findFirst({
                where: and(eq(globalPurchases.id, rowId), withActiveTenant(globalPurchases, teamId)),
            });

            if (!existing) {
                return error('Строка закупки не найдена', 'NOT_FOUND');
            }

            const patch = parsed.data;
            const nextQty = patch.qty ?? existing.qty;
            const nextPrice = patch.price ?? existing.price;

            const [updated] = await db.update(globalPurchases)
                .set({
                    ...patch,
                    qty: nextQty,
                    price: nextPrice,
                    amount: calculateAmount(nextQty, nextPrice),
                    updatedAt: new Date(),
                })
                .where(and(eq(globalPurchases.id, rowId), withActiveTenant(globalPurchases, teamId)))
                .returning();

            return success(toRow(updated));
        } catch (serviceError) {
            console.error('GlobalPurchasesService.patch error', serviceError);
            return error('Не удалось обновить строку закупки');
        }
    }

    static async remove(teamId: number, rowId: string): Promise<Result<{ removedId: string }>> {
        try {
            const [deleted] = await db.update(globalPurchases)
                .set({
                    deletedAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(and(eq(globalPurchases.id, rowId), withActiveTenant(globalPurchases, teamId), isNull(globalPurchases.deletedAt)))
                .returning({ id: globalPurchases.id });

            if (!deleted) {
                return error('Строка закупки не найдена', 'NOT_FOUND');
            }

            return success({ removedId: deleted.id });
        } catch (serviceError) {
            console.error('GlobalPurchasesService.remove error', serviceError);
            return error('Не удалось удалить строку закупки');
        }
    }
}
