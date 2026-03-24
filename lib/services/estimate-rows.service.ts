import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/data/db/drizzle';
import { estimateRows, estimates } from '@/lib/data/db/schema';
import { withActiveTenant } from '@/lib/data/db/queries';
import { Result, error, success } from '@/lib/utils/result';
import { applyEstimateCoefficient } from '@/lib/utils/estimate-coefficient';
import { EstimateRow } from '@/features/projects/estimates/types/dto';
import { EstimateExecutionService } from '@/lib/services/estimate-execution.service';

const addWorkSchema = z.object({
    name: z.string().trim().min(1),
    unit: z.string().trim().min(1).default('шт'),
    qty: z.number().nonnegative().default(1),
    price: z.number().nonnegative().default(0),
    expense: z.number().nonnegative().default(0),
    insertAfterWorkId: z.string().uuid().optional(),
});


const addSectionSchema = z.object({
    code: z.string().trim().min(1).max(30),
    name: z.string().trim().min(1).max(200),
    insertAfterRowId: z.string().uuid().optional(),
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

const toEstimateRowDto = (row: EstimateRowEntity, coefPercent: number): EstimateRow => {
    if (row.kind === 'section') {
        return {
            ...row,
            parentWorkId: row.parentWorkId ?? undefined,
            materialId: row.materialId ?? undefined,
            imageUrl: row.imageUrl ?? undefined,
            basePrice: row.price,
            price: 0,
            sum: 0,
            qty: 0,
            expense: 0,
            unit: '',
        };
    }

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

const renumberEstimateCodes = async (
    tx: typeof db,
    teamId: number,
    estimateId: string,
    options?: { startOrder?: number; full?: boolean },
) => {
    const full = options?.full ?? false;
    const startOrder = options?.startOrder;
    const hasStartOrder = typeof startOrder === 'number';

    const rowsQuery = tx
        .select({
            id: estimateRows.id,
            kind: estimateRows.kind,
            parentWorkId: estimateRows.parentWorkId,
            code: estimateRows.code,
            order: estimateRows.order,
        })
        .from(estimateRows)
        .where(
            and(
                eq(estimateRows.estimateId, estimateId),
                withActiveTenant(estimateRows, teamId),
                !full && hasStartOrder ? sql`${estimateRows.order} >= ${startOrder}` : undefined,
            ),
        )
        .orderBy(estimateRows.order);

    const rows = await rowsQuery;
    if (rows.length === 0) {
        return;
    }

    let workIndex = 0;
    const nextCodeById = new Map<string, string>();

    if (!full && hasStartOrder) {
        const [{ count }] = await tx
            .select({ count: sql<number>`COUNT(*)::int` })
            .from(estimateRows)
            .where(
                and(
                    eq(estimateRows.estimateId, estimateId),
                    eq(estimateRows.kind, 'work'),
                    withActiveTenant(estimateRows, teamId),
                    sql`${estimateRows.order} < ${startOrder}`,
                ),
            );
        workIndex = count;

        const parentIds = Array.from(new Set(rows.map((row) => row.parentWorkId).filter((id): id is string => Boolean(id))));
        if (parentIds.length > 0) {
            const parentRows = await tx
                .select({ id: estimateRows.id, code: estimateRows.code })
                .from(estimateRows)
                .where(and(inArray(estimateRows.id, parentIds), withActiveTenant(estimateRows, teamId)));

            for (const parent of parentRows) {
                nextCodeById.set(parent.id, parent.code);
            }
        }
    }

    for (const row of rows) {
        if (row.kind !== 'work') {
            continue;
        }

        workIndex += 1;
        nextCodeById.set(row.id, String(workIndex));
    }

    const materialCounters = new Map<string, number>();

    if (!full && hasStartOrder) {
        const updatedWorkIds = new Set(rows.filter((row) => row.kind === 'work').map((row) => row.id));

        const externalParentIds = Array.from(
            new Set(
                rows
                    .filter((row) => row.kind === 'material' && row.parentWorkId && !updatedWorkIds.has(row.parentWorkId))
                    .map((row) => row.parentWorkId as string),
            ),
        );

        if (externalParentIds.length > 0) {
            const counters = await tx
                .select({
                    parentWorkId: estimateRows.parentWorkId,
                    count: sql<number>`COUNT(*)::int`,
                })
                .from(estimateRows)
                .where(
                    and(
                        eq(estimateRows.estimateId, estimateId),
                        withActiveTenant(estimateRows, teamId),
                        inArray(estimateRows.parentWorkId, externalParentIds),
                        sql`${estimateRows.order} < ${startOrder}`,
                    ),
                )
                .groupBy(estimateRows.parentWorkId);

            for (const counter of counters) {
                if (counter.parentWorkId) {
                    materialCounters.set(counter.parentWorkId, counter.count);
                }
            }
        }
    }

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

    const updates = rows
        .map((row) => {
            const nextCode = nextCodeById.get(row.id);
            if (!nextCode || nextCode === row.code) {
                return null;
            }
            return { id: row.id, code: nextCode };
        })
        .filter((update): update is { id: string; code: string } => update !== null);

    if (updates.length > 0) {
        const values = updates.map((update) => sql`(${update.id}::uuid, ${update.code})`);

        await tx.execute(sql`
            UPDATE ${estimateRows}
            SET
                code = v.code,
                updated_at = ${now.toISOString()}::timestamp
            FROM (VALUES ${sql.join(values, sql`, `)}) AS v(id, code)
            WHERE ${estimateRows.id} = v.id AND ${withActiveTenant(estimateRows, teamId)}
        `);
    }
};

const roundContribution = (value: number) => Math.round(value);

const estimateRowContribution = (row: Pick<EstimateRowEntity, 'kind' | 'sum'>, coefPercent: number) => {
    if (row.kind === 'work') {
        return row.sum * (1 + coefPercent / 100);
    }
    if (row.kind === 'material') {
        return row.sum;
    }
    return 0;
};

const recalculateEstimateTotal = async (tx: typeof db, estimateId: string) => {
    const estimate = await tx.query.estimates.findFirst({
        where: eq(estimates.id, estimateId),
        columns: { coefPercent: true },
    });

    const coefPercent = estimate?.coefPercent ?? 0;

    const [{ total }] = await tx
        .select({
            total: sql<number>`COALESCE(
                SUM(
                    CASE 
                        WHEN ${estimateRows.kind} = 'work' 
                        THEN ${estimateRows.sum} * (1 + ${coefPercent} / 100.0) 
                        ELSE ${estimateRows.sum} 
                    END
                ), 
                0
            )`
        })
        .from(estimateRows)
        .where(and(eq(estimateRows.estimateId, estimateId), isNull(estimateRows.deletedAt)));

    await tx
        .update(estimates)
        .set({ total: Math.round(total), updatedAt: new Date() })
        .where(eq(estimates.id, estimateId));
};

const applyEstimateTotalDelta = async (tx: typeof db, estimateId: string, delta: number) => {
    if (delta === 0) {
        return;
    }

    await tx
        .update(estimates)
        .set({
            total: sql`GREATEST(0, ROUND(${estimates.total} + ${delta}))::int`,
            updatedAt: new Date(),
        })
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
                const payload = parsed.data;

                if (!payload.insertAfterWorkId) {
                    const normalizedWorkName = normalizeName(payload.name);

                    const duplicateWork = await tx
                        .select({ id: estimateRows.id })
                        .from(estimateRows)
                        .where(
                            and(
                                eq(estimateRows.estimateId, estimateId),
                                eq(estimateRows.kind, 'work'),
                                withActiveTenant(estimateRows, teamId),
                                sql`lower(trim(${estimateRows.name})) = ${normalizedWorkName}`,
                            ),
                        )
                        .limit(1);

                    if (duplicateWork.length > 0) {
                        throw new Error('DUPLICATE_WORK_NAME');
                    }

                    const [{ maxOrder, worksCount }] = await tx
                        .select({
                            maxOrder: sql<number>`COALESCE(MAX(${estimateRows.order}), 0)`,
                            worksCount: sql<number>`COALESCE(COUNT(*) FILTER (WHERE ${estimateRows.kind} = 'work'), 0)::int`,
                        })
                        .from(estimateRows)
                        .where(and(eq(estimateRows.estimateId, estimateId), withActiveTenant(estimateRows, teamId)));

                    const nextOrder = maxOrder + 100;

                    const [createdRow] = await tx
                        .insert(estimateRows)
                        .values({
                            tenantId: teamId,
                            estimateId,
                            kind: 'work',
                            code: String(worksCount + 1),
                            name: payload.name,
                            unit: payload.unit,
                            qty: payload.qty,
                            price: payload.price,
                            sum: payload.qty * payload.price,
                            expense: payload.expense,
                            order: nextOrder,
                        })
                        .returning();

                    const delta = roundContribution(estimateRowContribution(createdRow as EstimateRowEntity, estimate.coefPercent ?? 0));
                    await applyEstimateTotalDelta(tx, estimateId, delta);

                    return createdRow;
                }

                const existingRows = await tx
                    .select({ id: estimateRows.id, order: estimateRows.order, kind: estimateRows.kind, name: estimateRows.name })
                    .from(estimateRows)
                    .where(and(eq(estimateRows.estimateId, estimateId), withActiveTenant(estimateRows, teamId)));

                const normalizedWorkName = normalizeName(payload.name);
                const duplicateWorkExists = existingRows.some((row) => row.kind === 'work' && normalizeName(row.name) === normalizedWorkName);

                if (duplicateWorkExists) {
                    throw new Error('DUPLICATE_WORK_NAME');
                }

                const maxOrder = existingRows.reduce((max, row) => Math.max(max, row.order), 0);
                const workRows = existingRows
                    .filter((row) => row.kind === 'work')
                    .sort((left, right) => left.order - right.order);

                let nextOrder = maxOrder + 100;

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

                const [inserted] = await tx
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

                await renumberEstimateCodes(tx, teamId, estimateId, { startOrder: nextOrder });

                const row = await tx.query.estimateRows.findFirst({
                    where: and(eq(estimateRows.id, inserted.id), withActiveTenant(estimateRows, teamId)),
                });

                if (!row) {
                    throw new Error('CREATED_ROW_NOT_FOUND');
                }

                const delta = roundContribution(estimateRowContribution(inserted as EstimateRowEntity, estimate.coefPercent ?? 0));
                await applyEstimateTotalDelta(tx, estimateId, delta);
                return row;
            });

            await EstimateExecutionService.bumpSyncVersion(teamId, estimateId);

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

    static async addSection(teamId: number, estimateId: string, rawPayload?: unknown): Promise<Result<EstimateRow>> {
        const parsed = addSectionSchema.safeParse(rawPayload ?? {});
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
                let nextOrder = 100;

                if (payload.insertAfterRowId) {
                    const anchorRow = await tx.query.estimateRows.findFirst({
                        where: and(
                            eq(estimateRows.id, payload.insertAfterRowId),
                            eq(estimateRows.estimateId, estimateId),
                            withActiveTenant(estimateRows, teamId),
                        ),
                        columns: { order: true },
                    });

                    if (!anchorRow) {
                        throw new Error('ANCHOR_ROW_NOT_FOUND');
                    }

                    nextOrder = anchorRow.order + 1;
                } else {
                    const [{ maxOrder }] = await tx
                        .select({ maxOrder: sql<number>`COALESCE(MAX(${estimateRows.order}), 0)` })
                        .from(estimateRows)
                        .where(and(eq(estimateRows.estimateId, estimateId), withActiveTenant(estimateRows, teamId)));

                    nextOrder = maxOrder + 100;
                }

                await tx
                    .update(estimateRows)
                    .set({ order: sql`${estimateRows.order} + 1` })
                    .where(and(eq(estimateRows.estimateId, estimateId), withActiveTenant(estimateRows, teamId), sql`${estimateRows.order} >= ${nextOrder}`));

                const normalizedSectionCode = payload.code.trim().toLocaleLowerCase();
                const duplicateSectionCode = await tx
                    .select({ id: estimateRows.id })
                    .from(estimateRows)
                    .where(
                        and(
                            eq(estimateRows.estimateId, estimateId),
                            eq(estimateRows.kind, 'section'),
                            withActiveTenant(estimateRows, teamId),
                            sql`lower(trim(${estimateRows.code})) = ${normalizedSectionCode}`,
                        ),
                    )
                    .limit(1);

                if (duplicateSectionCode.length > 0) {
                    throw new Error('DUPLICATE_SECTION_CODE');
                }

                const [section] = await tx
                    .insert(estimateRows)
                    .values({
                        tenantId: teamId,
                        estimateId,
                        kind: 'section',
                        code: payload.code,
                        name: payload.name,
                        unit: '',
                        qty: 0,
                        price: 0,
                        sum: 0,
                        expense: 0,
                        order: nextOrder,
                    })
                    .returning();

                await renumberEstimateCodes(tx, teamId, estimateId, { startOrder: nextOrder });

                return section;
            });

            return success(toEstimateRowDto(created as EstimateRowEntity, estimate.coefPercent ?? 0));
        } catch (e) {
            if (e instanceof Error && e.message === 'ANCHOR_ROW_NOT_FOUND') {
                return error('Строка для вставки раздела не найдена', 'NOT_FOUND');
            }

            if (e instanceof Error && e.message === 'DUPLICATE_SECTION_CODE') {
                return error('Раздел с таким номером уже существует', 'CONFLICT');
            }

            console.error('EstimateRowsService.addSection error:', e);
            return error('Ошибка при добавлении раздела');
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

                const expenseValue = payload.expense || (parent.qty > 0 ? payload.qty / parent.qty : 0);
                const roundedExpense = Math.round(expenseValue * 1000000) / 1000000;

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
                        expense: roundedExpense,
                        order,
                    })
                    .returning();

                const delta = roundContribution(estimateRowContribution(row as EstimateRowEntity, estimate.coefPercent ?? 0));
                await applyEstimateTotalDelta(tx, estimateId, delta);
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
                    where: and(eq(estimateRows.id, rowId), eq(estimateRows.estimateId, estimateId), withActiveTenant(estimateRows, teamId)),
                });

                if (!existing) {
                    throw new Error('Row not found');
                }

                const patch = parsed.data;

                if (existing.kind === 'section') {
                    const [row] = await tx
                        .update(estimateRows)
                        .set({
                            name: patch.name ?? existing.name,
                            updatedAt: new Date(),
                        })
                        .where(eq(estimateRows.id, rowId))
                        .returning();

                    return { row, touchedWork: false };
                }

                let nextQty = patch.qty ?? existing.qty;
                const nextPrice = patch.price ?? existing.price;
                let nextExpense = patch.expense ?? existing.expense;

                // 1. Двусторонняя связь Qty <-> Expense для материалов
                if (existing.kind === 'material' && existing.parentWorkId) {
                    const parentWork = await tx.query.estimateRows.findFirst({
                        where: and(eq(estimateRows.id, existing.parentWorkId), withActiveTenant(estimateRows, teamId)),
                    });

                    if (parentWork) {
                        if (patch.qty !== undefined && patch.expense === undefined) {
                            // Если поменяли Qty -> считаем Expense
                            const calculatedExpense = parentWork.qty > 0 ? patch.qty / parentWork.qty : 0;
                            nextExpense = Math.round(calculatedExpense * 10000) / 10000;
                        } else if (patch.expense !== undefined && patch.qty === undefined) {
                            // Если поменяли Expense -> считаем Qty
                            nextQty = Math.ceil(parentWork.qty * patch.expense);
                        }
                    }
                }

                const [row] = await tx
                    .update(estimateRows)
                    .set({
                        ...patch,
                        qty: nextQty,
                        price: nextPrice,
                        expense: nextExpense,
                        sum: nextQty * nextPrice,
                        updatedAt: new Date(),
                    })
                    .where(eq(estimateRows.id, rowId))
                    .returning();

                // 2. Каскадное обновление материалов при изменении объема работы
                if (existing.kind === 'work' && patch.qty !== undefined && patch.qty !== existing.qty) {
                    const children = await tx
                        .select()
                        .from(estimateRows)
                        .where(and(eq(estimateRows.parentWorkId, rowId), eq(estimateRows.estimateId, estimateId), isNull(estimateRows.deletedAt)));

                    for (const child of children) {
                        // Если у материала расход 0, пытаемся его восстановить из текущего количества и старого объема работы
                        const effectiveExpense = child.expense > 0 ? child.expense : (existing.qty > 0 ? child.qty / existing.qty : 0);
                        const newChildQty = Math.ceil(nextQty * effectiveExpense);

                        await tx
                            .update(estimateRows)
                            .set({
                                qty: newChildQty,
                                expense: effectiveExpense,
                                sum: newChildQty * child.price,
                                updatedAt: new Date(),
                            })
                            .where(eq(estimateRows.id, child.id));
                    }
                }

                await recalculateEstimateTotal(tx, estimateId);
                return { row, touchedWork: existing.kind === 'work' };
            });

            if (updated.touchedWork) {
                await EstimateExecutionService.bumpSyncVersion(teamId, estimateId);
            }

            return success(toEstimateRowDto(updated.row as EstimateRowEntity, estimate.coefPercent ?? 0));
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
            const removedResult = await db.transaction(async (tx) => {
                const row = await tx.query.estimateRows.findFirst({
                    where: and(eq(estimateRows.id, rowId), eq(estimateRows.estimateId, estimateId), withActiveTenant(estimateRows, teamId)),
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

                const rowsToDelete = await tx
                    .select({ kind: estimateRows.kind, sum: estimateRows.sum })
                    .from(estimateRows)
                    .where(and(eq(estimateRows.estimateId, estimateId), inArray(estimateRows.id, idsToDelete), withActiveTenant(estimateRows, teamId)));

                await tx
                    .update(estimateRows)
                    .set({ deletedAt, updatedAt: deletedAt })
                    .where(and(eq(estimateRows.estimateId, estimateId), inArray(estimateRows.id, idsToDelete), withActiveTenant(estimateRows, teamId)));

                const delta = rowsToDelete.reduce(
                    (acc, item) => acc - estimateRowContribution(item as Pick<EstimateRowEntity, 'kind' | 'sum'>, estimate.coefPercent ?? 0),
                    0,
                );

                await renumberEstimateCodes(tx, teamId, estimateId, { startOrder: row.order });
                await applyEstimateTotalDelta(tx, estimateId, roundContribution(delta));

                return { idsToDelete, removedWork: row.kind === 'work' };
            });

            if (removedResult.removedWork) {
                await EstimateExecutionService.bumpSyncVersion(teamId, estimateId);
            }

            return success({ removedIds: removedResult.idsToDelete });
        } catch (e) {
            console.error('EstimateRowsService.remove error:', e);
            return error('Ошибка при удалении строки сметы');
        }
    }
}

export const EstimateRowsMaintenance = {
    recalculateEstimateTotal,
    renumberEstimateCodes,
};
