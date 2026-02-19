import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/data/db/drizzle';
import { estimateRows, estimates } from '@/lib/data/db/schema';
import { withActiveTenant } from '@/lib/data/db/queries';
import { Result, error, success } from '@/lib/utils/result';
import { applyEstimateCoefficient } from '@/lib/utils/estimate-coefficient';
import { EstimateRow } from '@/features/projects/estimates/types/dto';

const addWorkSchema = z.object({
    name: z.string().trim().min(1),
    unit: z.string().trim().min(1).default('шт'),
    qty: z.number().nonnegative().default(1),
    price: z.number().nonnegative().default(0),
    expense: z.number().nonnegative().default(0),
    insertAfterWorkId: z.string().uuid().optional(),
});

const addMaterialSchema = z.object({
    name: z.string().trim().min(1).optional().default('Новый материал'),
    unit: z.string().trim().min(1).default('шт'),
    materialId: z.string().uuid().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
    qty: z.number().nonnegative().default(1),
    price: z.number().nonnegative().default(0),
    expense: z.number().nonnegative().default(0),
});

const patchRowSchema = z.object({
    name: z.string().trim().min(1).optional(),
    unit: z.string().trim().min(1).optional(),
    materialId: z.string().uuid().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
    qty: z.number().nonnegative().optional(),
    price: z.number().nonnegative().optional(),
    expense: z.number().nonnegative().optional(),
});

type EstimateRowEntity = {
    id: string;
    kind: 'work' | 'material';
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

const toEstimateRowDto = (row: EstimateRowEntity, coefPercent: number): EstimateRow => {
    if (row.kind !== 'work') {
        return {
            ...row,
            parentWorkId: row.parentWorkId ?? undefined,
            materialId: row.materialId ?? undefined,
            imageUrl: row.imageUrl ?? undefined,
            basePrice: row.price,
        };
    }

    const effectivePrice = applyEstimateCoefficient(row.price, coefPercent);
    return {
        ...row,
        parentWorkId: row.parentWorkId ?? undefined,
        materialId: row.materialId ?? undefined,
        imageUrl: row.imageUrl ?? undefined,
        basePrice: row.price,
        price: effectivePrice,
        sum: effectivePrice * row.qty,
    };
};

const ensureEstimateAccess = async (teamId: number, estimateId: string) => {
    const estimate = await db.query.estimates.findFirst({
        where: and(eq(estimates.id, estimateId), withActiveTenant(estimates, teamId)),
    });

    return estimate;
};

const normalizeName = (value: string) => value.trim().toLocaleLowerCase();

const renumberEstimateCodes = async (tx: typeof db, teamId: number, estimateId: string) => {
    const rows = await tx
        .select({
            id: estimateRows.id,
            kind: estimateRows.kind,
            parentWorkId: estimateRows.parentWorkId,
            code: estimateRows.code,
            order: estimateRows.order,
        })
        .from(estimateRows)
        .where(and(eq(estimateRows.estimateId, estimateId), withActiveTenant(estimateRows, teamId)))
        .orderBy(estimateRows.order);

    let workIndex = 0;
    const nextCodeById = new Map<string, string>();

    for (const row of rows) {
        if (row.kind !== 'work') {
            continue;
        }

        workIndex += 1;
        nextCodeById.set(row.id, String(workIndex));
    }

    const materialCounters = new Map<string, number>();

    for (const row of rows) {
        if (row.kind !== 'material' || !row.parentWorkId) {
            continue;
        }

        const parentCode = nextCodeById.get(row.parentWorkId);
        if (!parentCode) {
            continue;
        }

        const nextCounter = (materialCounters.get(row.parentWorkId) ?? 0) + 1;
        materialCounters.set(row.parentWorkId, nextCounter);
        nextCodeById.set(row.id, `${parentCode}.${nextCounter}`);
    }

    const now = new Date();

    for (const row of rows) {
        const nextCode = nextCodeById.get(row.id);
        if (!nextCode || nextCode === row.code) {
            continue;
        }

        await tx
            .update(estimateRows)
            .set({ code: nextCode, updatedAt: now })
            .where(and(eq(estimateRows.id, row.id), withActiveTenant(estimateRows, teamId)));
    }
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
                    materialId: estimateRows.materialId,
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

            const coefPercent = estimate.coefPercent ?? 0;
            return success(rows.map((row) => toEstimateRowDto(row as EstimateRowEntity, coefPercent)));
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
                    .select({ order: estimateRows.order, kind: estimateRows.kind, name: estimateRows.name })
                    .from(estimateRows)
                    .where(and(eq(estimateRows.estimateId, estimateId), withActiveTenant(estimateRows, teamId)));

                const payload = parsed.data;
                const normalizedWorkName = normalizeName(payload.name);
                const duplicateWorkExists = currentRows.some((row) => row.kind === 'work' && normalizeName(row.name) === normalizedWorkName);

                if (duplicateWorkExists) {
                    throw new Error('DUPLICATE_WORK_NAME');
                }

                const rowsWithIds = await tx
                    .select({ id: estimateRows.id, order: estimateRows.order, kind: estimateRows.kind })
                    .from(estimateRows)
                    .where(and(eq(estimateRows.estimateId, estimateId), withActiveTenant(estimateRows, teamId)));

                const maxOrder = rowsWithIds.reduce((max, row) => Math.max(max, row.order), 0);
                const workRows = rowsWithIds
                    .filter((row) => row.kind === 'work')
                    .sort((left, right) => left.order - right.order);

                let nextOrder = maxOrder + 100;

                if (payload.insertAfterWorkId) {
                    const anchorWork = workRows.find((row) => row.id === payload.insertAfterWorkId);
                    if (!anchorWork) {
                        throw new Error('INSERT_ANCHOR_NOT_FOUND');
                    }

                    const nextWork = workRows.find((row) => row.order > anchorWork.order);
                    if (nextWork) {
                        nextOrder = nextWork.order;

                        await tx
                            .update(estimateRows)
                            .set({ order: sql`${estimateRows.order} + 100` })
                            .where(and(eq(estimateRows.estimateId, estimateId), withActiveTenant(estimateRows, teamId), sql`${estimateRows.order} >= ${nextOrder}`));
                    }
                }

                const [created] = await tx
                    .insert(estimateRows)
                    .values({
                        tenantId: teamId,
                        estimateId,
                        kind: 'work',
                        code: '0',
                        name: payload.name,
                        unit: payload.unit,
                        qty: payload.qty,
                        price: payload.price,
                        sum: payload.qty * payload.price,
                        expense: payload.expense,
                        order: nextOrder,
                    })
                    .returning();

                await renumberEstimateCodes(tx, teamId, estimateId);

                const row = await tx.query.estimateRows.findFirst({
                    where: and(eq(estimateRows.id, created.id), withActiveTenant(estimateRows, teamId)),
                });

                if (!row) {
                    throw new Error('CREATED_ROW_NOT_FOUND');
                }

                await recalculateEstimateTotal(tx, estimateId);
                return row;
            });

            return success(toEstimateRowDto(created as EstimateRowEntity, estimate.coefPercent ?? 0));
        } catch (e) {
            if (e instanceof Error && e.message === 'DUPLICATE_WORK_NAME') {
                return error('Работа с таким названием уже добавлена в смету', 'CONFLICT');
            }

            if (e instanceof Error && e.message === 'INSERT_ANCHOR_NOT_FOUND') {
                return error('Работа для вставки не найдена', 'NOT_FOUND');
            }

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
                        withActiveTenant(estimateRows, teamId),
                    ),
                });

                if (!parent) {
                    throw new Error('Parent work not found');
                }

                const children = await tx
                    .select({ order: estimateRows.order, name: estimateRows.name })
                    .from(estimateRows)
                    .where(and(eq(estimateRows.estimateId, estimateId), eq(estimateRows.parentWorkId, parentWorkId), withActiveTenant(estimateRows, teamId)))
                    .orderBy(estimateRows.order);

                const payload = parsed.data;
                const normalizedMaterialName = normalizeName(payload.name);
                const duplicateMaterialExists = children.some((row) => normalizeName(row.name) === normalizedMaterialName);

                if (duplicateMaterialExists) {
                    throw new Error('DUPLICATE_MATERIAL_NAME');
                }

                const order = children.length > 0 ? children[children.length - 1].order + 1 : parent.order + 1;

                await tx
                    .update(estimateRows)
                    .set({ order: sql`${estimateRows.order} + 1` })
                    .where(and(eq(estimateRows.estimateId, estimateId), withActiveTenant(estimateRows, teamId), sql`${estimateRows.order} >= ${order}`));

                const [row] = await tx
                    .insert(estimateRows)
                    .values({
                        tenantId: teamId,
                        estimateId,
                        kind: 'material',
                        parentWorkId,
                        code: `${parent.code}.${children.length + 1}`,
                        name: payload.name,
                        materialId: payload.materialId ?? null,
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

            return success(toEstimateRowDto(created as EstimateRowEntity, estimate.coefPercent ?? 0));
        } catch (e) {
            if (e instanceof Error && e.message === 'DUPLICATE_MATERIAL_NAME') {
                return error('Материал с таким названием уже добавлен в выбранную работу', 'CONFLICT');
            }

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

            return success(toEstimateRowDto(updated as EstimateRowEntity, estimate.coefPercent ?? 0));
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
