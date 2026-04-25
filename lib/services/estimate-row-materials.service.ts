import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/lib/data/db/drizzle';
import { estimateRows, estimates } from '@/lib/data/db/schema';
import { withActiveTenant } from '@/lib/data/db/queries';
import { Result, error, success } from '@/lib/utils/result';
import type { EstimateRow } from '@/features/projects/estimates/types/dto';
import { invalidateHomeDashboardCache } from './home-dashboard-cache';

const addMaterialSchema = z.object({
    name: z.string().trim().min(1).optional().default('Новый материал'),
    unit: z.string().trim().min(1).default('шт'),
    materialId: z.string().uuid().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
    qty: z.number().nonnegative().default(1),
    price: z.number().nonnegative().default(0),
    expense: z.number().nonnegative().default(0),
});

type EstimateRowEntity = {
    id: string;
    kind: 'section' | 'work' | 'material';
    parentWorkId: string | null;
    code: string;
    name: string;
    materialId: string | null;
    imageUrl: string | null;
    unit: string;
    qty: number;
    price: number;
    sum: number;
    expense: number;
    order: number;
};

const ORDER_SHIFT_STEP_ROW = 1;

const normalizeName = (value: string) => value.trim().toLocaleLowerCase();

const toEstimateRowDto = (row: EstimateRowEntity): EstimateRow => ({
    ...row,
    parentWorkId: row.parentWorkId ?? undefined,
    materialId: row.materialId ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    basePrice: row.price,
});

const resolveInsertOrder = (boundaryOrder: number, nextRowOrder: number | null) => {
    if (nextRowOrder === null) {
        return { order: boundaryOrder + ORDER_SHIFT_STEP_ROW, shouldShiftTail: false };
    }

    const gap = nextRowOrder - boundaryOrder;
    if (gap > 1) {
        return { order: boundaryOrder + Math.floor(gap / 2), shouldShiftTail: false };
    }

    return { order: nextRowOrder, shouldShiftTail: true };
};

const ensureEstimateAccess = async (teamId: number, estimateId: string) => db.query.estimates.findFirst({
    where: and(eq(estimates.id, estimateId), withActiveTenant(estimates, teamId)),
});

const applyEstimateTotalDelta = async (tx: typeof db, estimateId: string, delta: number) => {
    if (delta === 0) return;

    await tx
        .update(estimates)
        .set({
            total: sql`GREATEST(0, ROUND(${estimates.total} + ${delta}))::int`,
            updatedAt: new Date(),
        })
        .where(eq(estimates.id, estimateId));
};

export class EstimateRowMaterialsService {
    static async addMaterial(
        teamId: number,
        estimateId: string,
        parentWorkId: string,
        rawPayload: unknown,
    ): Promise<Result<EstimateRow>> {
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
                const payload = parsed.data;
                const normalizedMaterialName = normalizeName(payload.name);

                const parent = await tx.query.estimateRows.findFirst({
                    where: and(
                        eq(estimateRows.id, parentWorkId),
                        eq(estimateRows.estimateId, estimateId),
                        eq(estimateRows.kind, 'work'),
                        withActiveTenant(estimateRows, teamId),
                    ),
                    columns: {
                        id: true,
                        code: true,
                        qty: true,
                        order: true,
                    },
                });

                if (!parent) {
                    throw new Error('PARENT_WORK_NOT_FOUND');
                }

                const [childrenStats] = await tx
                    .select({
                        childrenCount: sql<number>`COUNT(*)::int`,
                        maxChildOrder: sql<number | null>`MAX(${estimateRows.order})`,
                        duplicateExists: sql<boolean>`COALESCE(BOOL_OR(lower(trim(${estimateRows.name})) = ${normalizedMaterialName}), false)`,
                    })
                    .from(estimateRows)
                    .where(and(
                        eq(estimateRows.estimateId, estimateId),
                        eq(estimateRows.parentWorkId, parentWorkId),
                        withActiveTenant(estimateRows, teamId),
                    ));

                if (childrenStats?.duplicateExists) {
                    throw new Error('DUPLICATE_MATERIAL_NAME');
                }

                const boundaryOrder = Number(childrenStats?.maxChildOrder ?? parent.order);
                const [nextRow] = await tx
                    .select({ order: estimateRows.order })
                    .from(estimateRows)
                    .where(and(
                        eq(estimateRows.estimateId, estimateId),
                        withActiveTenant(estimateRows, teamId),
                        sql`${estimateRows.order} > ${boundaryOrder}`,
                    ))
                    .orderBy(estimateRows.order)
                    .limit(1);

                const orderResolution = resolveInsertOrder(boundaryOrder, nextRow?.order ?? null);
                const order = orderResolution.order;

                if (orderResolution.shouldShiftTail) {
                    await tx
                        .update(estimateRows)
                        .set({ order: sql`${estimateRows.order} + ${ORDER_SHIFT_STEP_ROW}` })
                        .where(and(
                            eq(estimateRows.estimateId, estimateId),
                            withActiveTenant(estimateRows, teamId),
                            sql`${estimateRows.order} >= ${order}`,
                        ));
                }

                const expenseValue = payload.expense || (parent.qty > 0 ? payload.qty / parent.qty : 0);
                const roundedExpense = Math.round(expenseValue * 1000000) / 1000000;
                const sum = payload.qty * payload.price;

                const [row] = await tx
                    .insert(estimateRows)
                    .values({
                        tenantId: teamId,
                        estimateId,
                        kind: 'material',
                        parentWorkId,
                        code: `${parent.code}.${Number(childrenStats?.childrenCount ?? 0) + 1}`,
                        name: payload.name,
                        materialId: payload.materialId ?? null,
                        imageUrl: payload.imageUrl ?? null,
                        unit: payload.unit,
                        qty: payload.qty,
                        price: payload.price,
                        sum,
                        expense: roundedExpense,
                        order,
                    })
                    .returning();

                await applyEstimateTotalDelta(tx, estimateId, Math.round(sum));

                return row;
            });

            invalidateHomeDashboardCache(teamId);
            return success(toEstimateRowDto(created as EstimateRowEntity));
        } catch (e) {
            if (e instanceof Error && e.message === 'DUPLICATE_MATERIAL_NAME') {
                return error('Материал с таким названием уже добавлен в выбранную работу', 'CONFLICT');
            }

            if (e instanceof Error && e.message === 'PARENT_WORK_NOT_FOUND') {
                return error('Работа для добавления материала не найдена', 'NOT_FOUND');
            }

            console.error('EstimateRowMaterialsService.addMaterial error:', e);
            return error('Ошибка при добавлении материала');
        }
    }
}
