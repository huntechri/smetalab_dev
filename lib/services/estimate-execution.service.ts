import { and, asc, eq, inArray, notInArray, sql } from 'drizzle-orm';
import { db } from '@/lib/data/db/drizzle';
import { estimateExecutionRows, estimateRows, estimates } from '@/lib/data/db/schema';
import { withActiveTenant } from '@/lib/data/db/queries';
import { Result, error, success } from '@/lib/utils/result';
import {
    AddExtraExecutionWorkInput,
    EstimateExecutionRow,
    EstimateExecutionRowPatch,
    addExtraExecutionWorkSchema,
    estimateExecutionRowPatchSchema,
} from '@/features/projects/estimates/types/execution.dto';

const ensureEstimateAccess = async (teamId: number, estimateId: string) => {
    const estimate = await db.query.estimates.findFirst({
        where: and(eq(estimates.id, estimateId), withActiveTenant(estimates, teamId)),
    });

    return estimate;
};

const estimateExecutionRowSelect = {
    id: estimateExecutionRows.id,
    estimateRowId: estimateExecutionRows.estimateRowId,
    source: estimateExecutionRows.source,
    status: estimateExecutionRows.status,
    code: estimateExecutionRows.code,
    name: estimateExecutionRows.name,
    unit: estimateExecutionRows.unit,
    plannedQty: estimateExecutionRows.plannedQty,
    plannedPrice: estimateExecutionRows.plannedPrice,
    plannedSum: estimateExecutionRows.plannedSum,
    actualQty: estimateExecutionRows.actualQty,
    actualPrice: estimateExecutionRows.actualPrice,
    actualSum: estimateExecutionRows.actualSum,
    isCompleted: estimateExecutionRows.isCompleted,
    order: estimateExecutionRows.order,
};

export class EstimateExecutionService {
    private static async syncFromEstimateWorks(teamId: number, estimateId: string): Promise<void> {
        await db.transaction(async (tx) => {
            const plannedWorks = await tx
                .select({
                    id: estimateRows.id,
                    code: estimateRows.code,
                    name: estimateRows.name,
                    unit: estimateRows.unit,
                    qty: estimateRows.qty,
                    price: estimateRows.price,
                    sum: estimateRows.sum,
                    order: estimateRows.order,
                })
                .from(estimateRows)
                .where(
                    and(
                        eq(estimateRows.estimateId, estimateId),
                        eq(estimateRows.kind, 'work'),
                        withActiveTenant(estimateRows, teamId),
                    ),
                )
                .orderBy(asc(estimateRows.order));

            const plannedIds = plannedWorks.map((work) => work.id);

            if (plannedIds.length > 0) {
                await tx
                    .update(estimateExecutionRows)
                    .set({ deletedAt: new Date(), updatedAt: new Date() })
                    .where(
                        and(
                            eq(estimateExecutionRows.estimateId, estimateId),
                            eq(estimateExecutionRows.source, 'from_estimate'),
                            withActiveTenant(estimateExecutionRows, teamId),
                            notInArray(estimateExecutionRows.estimateRowId, plannedIds),
                        ),
                    );
            }

            if (plannedIds.length === 0) {
                return;
            }

            const existing = await tx
                .select({
                    id: estimateExecutionRows.id,
                    estimateRowId: estimateExecutionRows.estimateRowId,
                    actualQty: estimateExecutionRows.actualQty,
                    actualPrice: estimateExecutionRows.actualPrice,
                    status: estimateExecutionRows.status,
                    isCompleted: estimateExecutionRows.isCompleted,
                })
                .from(estimateExecutionRows)
                .where(
                    and(
                        eq(estimateExecutionRows.estimateId, estimateId),
                        eq(estimateExecutionRows.source, 'from_estimate'),
                        withActiveTenant(estimateExecutionRows, teamId),
                        inArray(estimateExecutionRows.estimateRowId, plannedIds),
                    ),
                );

            const existingMap = new Map(existing.map((row) => [row.estimateRowId, row]));

            for (const work of plannedWorks) {
                const entity = existingMap.get(work.id);
                const now = new Date();

                if (!entity) {
                    await tx.insert(estimateExecutionRows).values({
                        tenantId: teamId,
                        estimateId,
                        estimateRowId: work.id,
                        source: 'from_estimate',
                        status: 'not_started',
                        code: work.code,
                        name: work.name,
                        unit: work.unit,
                        plannedQty: work.qty,
                        plannedPrice: work.price,
                        plannedSum: work.sum,
                        actualQty: work.qty,
                        actualPrice: work.price,
                        actualSum: work.qty * work.price,
                        order: work.order,
                        updatedAt: now,
                    });
                    continue;
                }

                await tx
                    .update(estimateExecutionRows)
                    .set({
                        deletedAt: null,
                        code: work.code,
                        name: work.name,
                        unit: work.unit,
                        plannedQty: work.qty,
                        plannedPrice: work.price,
                        plannedSum: work.sum,
                        actualSum: entity.actualQty * entity.actualPrice,
                        order: work.order,
                        updatedAt: now,
                    })
                    .where(eq(estimateExecutionRows.id, entity.id));
            }
        });
    }

    static async list(teamId: number, estimateId: string): Promise<Result<EstimateExecutionRow[]>> {
        try {
            const estimate = await ensureEstimateAccess(teamId, estimateId);
            if (!estimate) {
                return error('Смета не найдена', 'NOT_FOUND');
            }

            await this.syncFromEstimateWorks(teamId, estimateId);

            const rows = await db
                .select(estimateExecutionRowSelect)
                .from(estimateExecutionRows)
                .where(and(eq(estimateExecutionRows.estimateId, estimateId), withActiveTenant(estimateExecutionRows, teamId)))
                .orderBy(asc(estimateExecutionRows.order));

            return success(rows as EstimateExecutionRow[]);
        } catch (e) {
            console.error('EstimateExecutionService.list error:', e);
            return error('Ошибка при получении строк выполнения сметы');
        }
    }

    static async patch(teamId: number, estimateId: string, executionRowId: string, rawPatch: unknown, userId?: number): Promise<Result<EstimateExecutionRow>> {
        const parsed = estimateExecutionRowPatchSchema.safeParse(rawPatch);
        if (!parsed.success) {
            return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');
        }

        try {
            const estimate = await ensureEstimateAccess(teamId, estimateId);
            if (!estimate) {
                return error('Смета не найдена', 'NOT_FOUND');
            }

            const updated = await db.transaction(async (tx) => {
                const existing = await tx.query.estimateExecutionRows.findFirst({
                    where: and(
                        eq(estimateExecutionRows.id, executionRowId),
                        eq(estimateExecutionRows.estimateId, estimateId),
                        withActiveTenant(estimateExecutionRows, teamId),
                    ),
                });

                if (!existing) {
                    throw new Error('NOT_FOUND');
                }

                const patch = parsed.data as EstimateExecutionRowPatch;
                const nextQty = patch.actualQty ?? existing.actualQty;
                const nextPrice = patch.actualPrice ?? existing.actualPrice;
                const nextStatus = patch.status ?? existing.status;
                const nextCompleted = patch.isCompleted ?? existing.isCompleted;

                const shouldComplete = nextCompleted || nextStatus === 'done';

                const [row] = await tx
                    .update(estimateExecutionRows)
                    .set({
                        actualQty: nextQty,
                        actualPrice: nextPrice,
                        actualSum: nextQty * nextPrice,
                        status: nextStatus,
                        isCompleted: shouldComplete,
                        completedAt: shouldComplete ? new Date() : null,
                        completedByUserId: shouldComplete && userId ? userId : null,
                        updatedAt: new Date(),
                    })
                    .where(eq(estimateExecutionRows.id, executionRowId))
                    .returning(estimateExecutionRowSelect);

                return row;
            });

            return success(updated as EstimateExecutionRow);
        } catch (e) {
            console.error('EstimateExecutionService.patch error:', e);
            return error('Ошибка при обновлении строки выполнения');
        }
    }

    static async addExtraWork(teamId: number, estimateId: string, rawPayload: unknown): Promise<Result<EstimateExecutionRow>> {
        const parsed = addExtraExecutionWorkSchema.safeParse(rawPayload);
        if (!parsed.success) {
            return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');
        }

        try {
            const estimate = await ensureEstimateAccess(teamId, estimateId);
            if (!estimate) {
                return error('Смета не найдена', 'NOT_FOUND');
            }

            const payload = parsed.data as AddExtraExecutionWorkInput;

            const [created] = await db.transaction(async (tx) => {
                const [{ maxOrder }] = await tx
                    .select({ maxOrder: sql<number>`COALESCE(MAX(${estimateExecutionRows.order}), 0)` })
                    .from(estimateExecutionRows)
                    .where(and(eq(estimateExecutionRows.estimateId, estimateId), withActiveTenant(estimateExecutionRows, teamId)));

                return tx
                    .insert(estimateExecutionRows)
                    .values({
                        tenantId: teamId,
                        estimateId,
                        estimateRowId: null,
                        source: 'extra',
                        status: 'not_started',
                        code: payload.code ?? 'Доп',
                        name: payload.name,
                        unit: payload.unit,
                        plannedQty: 0,
                        plannedPrice: 0,
                        plannedSum: 0,
                        actualQty: payload.actualQty,
                        actualPrice: payload.actualPrice,
                        actualSum: payload.actualQty * payload.actualPrice,
                        order: maxOrder + 100,
                    })
                    .returning(estimateExecutionRowSelect);
            });

            return success(created as EstimateExecutionRow);
        } catch (e) {
            console.error('EstimateExecutionService.addExtraWork error:', e);
            return error('Ошибка при добавлении дополнительной работы');
        }
    }
}
