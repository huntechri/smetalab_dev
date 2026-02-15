import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/data/db/drizzle';
import { estimateRows, estimates } from '@/lib/data/db/schema';
import { withActiveTenant } from '@/lib/data/db/queries';
import { Result, error, success } from '@/lib/utils/result';
import { EstimateRow } from '@/features/projects/estimates/types/dto';

const addWorkSchema = z.object({
    name: z.string().trim().min(1),
    unit: z.string().trim().min(1).default('шт'),
    qty: z.number().nonnegative().default(1),
    price: z.number().nonnegative().default(0),
    expense: z.number().nonnegative().default(0),
});

const addMaterialSchema = z.object({
    name: z.string().trim().min(1).optional().default('Новый материал'),
    unit: z.string().trim().min(1).default('шт'),
    imageUrl: z.string().url().nullable().optional(),
    qty: z.number().nonnegative().default(1),
    price: z.number().nonnegative().default(0),
    expense: z.number().nonnegative().default(0),
});

const patchRowSchema = z.object({
    name: z.string().trim().min(1).optional(),
    unit: z.string().trim().min(1).optional(),
    imageUrl: z.string().url().nullable().optional(),
    qty: z.number().nonnegative().optional(),
    price: z.number().nonnegative().optional(),
    expense: z.number().nonnegative().optional(),
});

const ensureEstimateAccess = async (teamId: number, estimateId: string) => {
    const estimate = await db.query.estimates.findFirst({
        where: and(eq(estimates.id, estimateId), withActiveTenant(estimates, teamId)),
    });

    return estimate;
};

const recalculateEstimateTotal = async (tx: typeof db, estimateId: string) => {
    const [{ total }] = await tx
        .select({ total: sql<number>`COALESCE(SUM(${estimateRows.sum}), 0)` })
        .from(estimateRows)
        .where(and(eq(estimateRows.estimateId, estimateId), isNull(estimateRows.deletedAt)));

    await tx
        .update(estimates)
        .set({ total: Math.round(total), updatedAt: new Date() })
        .where(eq(estimates.id, estimateId));
};

export class EstimateRowsService {
    static async list(teamId: number, estimateId: string): Promise<Result<EstimateRow[]>> {
        try {
            const estimate = await ensureEstimateAccess(teamId, estimateId);
            if (!estimate) {
                return error('Смета не найдена', 'NOT_FOUND');
            }

            const rows = await db
                .select({
                    id: estimateRows.id,
                    kind: estimateRows.kind,
                    parentWorkId: estimateRows.parentWorkId,
                    code: estimateRows.code,
                    name: estimateRows.name,
                    imageUrl: estimateRows.imageUrl,
                    unit: estimateRows.unit,
                    qty: estimateRows.qty,
                    price: estimateRows.price,
                    sum: estimateRows.sum,
                    expense: estimateRows.expense,
                    order: estimateRows.order,
                })
                .from(estimateRows)
                .where(and(eq(estimateRows.estimateId, estimateId), withActiveTenant(estimateRows, teamId)))
                .orderBy(estimateRows.order);

            return success(rows as EstimateRow[]);
        } catch (e) {
            console.error('EstimateRowsService.list error:', e);
            return error('Ошибка при получении строк сметы');
        }
    }

    static async addWork(teamId: number, estimateId: string, rawPayload: unknown): Promise<Result<EstimateRow>> {
        const parsed = addWorkSchema.safeParse(rawPayload);
        if (!parsed.success) {
            return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');
        }

        try {
            const estimate = await ensureEstimateAccess(teamId, estimateId);
            if (!estimate) {
                return error('Смета не найдена', 'NOT_FOUND');
            }

            const created = await db.transaction(async (tx) => {
                const currentRows = await tx
                    .select({ order: estimateRows.order, kind: estimateRows.kind })
                    .from(estimateRows)
                    .where(and(eq(estimateRows.estimateId, estimateId), isNull(estimateRows.deletedAt)));

                const maxOrder = currentRows.reduce((max, row) => Math.max(max, row.order), 0);
                const nextCode = String(currentRows.filter((row) => row.kind === 'work').length + 1);
                const payload = parsed.data;
                const [row] = await tx
                    .insert(estimateRows)
                    .values({
                        tenantId: teamId,
                        estimateId,
                        kind: 'work',
                        code: nextCode,
                        name: payload.name,
                        unit: payload.unit,
                        qty: payload.qty,
                        price: payload.price,
                        sum: payload.qty * payload.price,
                        expense: payload.expense,
                        order: maxOrder + 100,
                    })
                    .returning();

                await recalculateEstimateTotal(tx, estimateId);
                return row;
            });

            return success(created as EstimateRow);
        } catch (e) {
            console.error('EstimateRowsService.addWork error:', e);
            return error('Ошибка при добавлении работы');
        }
    }

    static async addMaterial(teamId: number, estimateId: string, parentWorkId: string, rawPayload: unknown): Promise<Result<EstimateRow>> {
        const parsed = addMaterialSchema.safeParse(rawPayload ?? {});
        if (!parsed.success) {
            return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');
        }

        try {
            const estimate = await ensureEstimateAccess(teamId, estimateId);
            if (!estimate) {
                return error('Смета не найдена', 'NOT_FOUND');
            }

            const created = await db.transaction(async (tx) => {
                const parent = await tx.query.estimateRows.findFirst({
                    where: and(
                        eq(estimateRows.id, parentWorkId),
                        eq(estimateRows.estimateId, estimateId),
                        eq(estimateRows.kind, 'work'),
                        isNull(estimateRows.deletedAt),
                    ),
                });

                if (!parent) {
                    throw new Error('Parent work not found');
                }

                const children = await tx
                    .select({ order: estimateRows.order })
                    .from(estimateRows)
                    .where(and(eq(estimateRows.parentWorkId, parentWorkId), isNull(estimateRows.deletedAt)))
                    .orderBy(estimateRows.order);

                const order = children.length > 0 ? children[children.length - 1].order + 1 : parent.order + 1;

                await tx
                    .update(estimateRows)
                    .set({ order: sql`${estimateRows.order} + 1` })
                    .where(and(eq(estimateRows.estimateId, estimateId), isNull(estimateRows.deletedAt), sql`${estimateRows.order} >= ${order}`));

                const payload = parsed.data;
                const [row] = await tx
                    .insert(estimateRows)
                    .values({
                        tenantId: teamId,
                        estimateId,
                        kind: 'material',
                        parentWorkId,
                        code: `${parent.code}.${children.length + 1}`,
                        name: payload.name,
                        imageUrl: payload.imageUrl ?? null,
                        unit: payload.unit,
                        qty: payload.qty,
                        price: payload.price,
                        sum: payload.qty * payload.price,
                        expense: payload.expense,
                        order,
                    })
                    .returning();

                await recalculateEstimateTotal(tx, estimateId);
                return row;
            });

            return success(created as EstimateRow);
        } catch (e) {
            console.error('EstimateRowsService.addMaterial error:', e);
            return error('Ошибка при добавлении материала');
        }
    }

    static async patch(teamId: number, estimateId: string, rowId: string, rawPatch: unknown): Promise<Result<EstimateRow>> {
        const parsed = patchRowSchema.safeParse(rawPatch);
        if (!parsed.success) {
            return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');
        }

        try {
            const estimate = await ensureEstimateAccess(teamId, estimateId);
            if (!estimate) {
                return error('Смета не найдена', 'NOT_FOUND');
            }

            const updated = await db.transaction(async (tx) => {
                const existing = await tx.query.estimateRows.findFirst({
                    where: and(eq(estimateRows.id, rowId), eq(estimateRows.estimateId, estimateId), isNull(estimateRows.deletedAt)),
                });

                if (!existing) {
                    throw new Error('Row not found');
                }

                const patch = parsed.data;
                const nextQty = patch.qty ?? existing.qty;
                const nextPrice = patch.price ?? existing.price;

                const [row] = await tx
                    .update(estimateRows)
                    .set({
                        ...patch,
                        qty: nextQty,
                        price: nextPrice,
                        sum: nextQty * nextPrice,
                        updatedAt: new Date(),
                    })
                    .where(eq(estimateRows.id, rowId))
                    .returning();

                await recalculateEstimateTotal(tx, estimateId);
                return row;
            });

            return success(updated as EstimateRow);
        } catch (e) {
            console.error('EstimateRowsService.patch error:', e);
            return error('Ошибка при обновлении строки сметы');
        }
    }

    static async remove(teamId: number, estimateId: string, rowId: string): Promise<Result<{ removedIds: string[] }>> {
        try {
            const estimate = await ensureEstimateAccess(teamId, estimateId);
            if (!estimate) {
                return error('Смета не найдена', 'NOT_FOUND');
            }

            const deletedAt = new Date();
            const removedIds = await db.transaction(async (tx) => {
                const row = await tx.query.estimateRows.findFirst({
                    where: and(eq(estimateRows.id, rowId), eq(estimateRows.estimateId, estimateId), isNull(estimateRows.deletedAt)),
                });

                if (!row) {
                    throw new Error('Row not found');
                }

                const idsToDelete = row.kind === 'work'
                    ? [
                        row.id,
                        ...(await tx
                            .select({ id: estimateRows.id })
                            .from(estimateRows)
                            .where(and(eq(estimateRows.parentWorkId, row.id), eq(estimateRows.estimateId, estimateId), isNull(estimateRows.deletedAt))))
                            .map((item) => item.id),
                    ]
                    : [row.id];

                await tx
                    .update(estimateRows)
                    .set({ deletedAt, updatedAt: deletedAt })
                    .where(and(eq(estimateRows.estimateId, estimateId), inArray(estimateRows.id, idsToDelete)));

                await recalculateEstimateTotal(tx, estimateId);

                return idsToDelete;
            });

            return success({ removedIds });
        } catch (e) {
            console.error('EstimateRowsService.remove error:', e);
            return error('Ошибка при удалении строки сметы');
        }
    }
}
