import { and, asc, eq, isNull, notInArray, sql } from 'drizzle-orm';
import { db } from '@/lib/data/db/drizzle';
import { estimateExecutionRows, estimateRows, estimates } from '@/lib/data/db/schema';
import { withActiveTenant } from '@/lib/data/db/queries';
import { Result, error, success } from '@/lib/utils/result';
import { applyEstimateCoefficient } from '@/lib/utils/estimate-coefficient';
import { ProjectProgressService } from '@/lib/services/project-progress.service';
import { invalidateHomeDashboardCache } from './home-dashboard-cache';
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

const isMissingRelationError = (value: unknown): value is { code: string } => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    return 'code' in value && typeof (value as { code?: unknown }).code === 'string';
};

const checkExecutionTableExists = async () => {
    const result = await db.execute(sql`SELECT to_regclass('public.estimate_execution_rows') AS table_name`);
    const rows = result as unknown as { table_name: string | null }[];
    return rows[0]?.table_name !== null;
};

let executionStorageReadyPromise: Promise<boolean> | null = null;

const ensureExecutionStorageReady = async () => {
    if (!executionStorageReadyPromise) {
        executionStorageReadyPromise = (async () => {
            // IMPORTANT: runtime request paths must remain read-only for schema compatibility.
            // DDL and migrations are allowed only via dedicated migration workflows.
            return checkExecutionTableExists();
        })().catch((error) => {
            executionStorageReadyPromise = null;
            throw error;
        });
    }

    return executionStorageReadyPromise;
};

export const resetExecutionStorageReadyStateForTests = () => {
    executionStorageReadyPromise = null;
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
    private static async syncFromEstimateWorks(tx: typeof db, teamId: number, estimateId: string, coefPercent: number): Promise<void> {
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

        if (plannedIds.length === 0) {
            // CORRECTNESS: when estimate has no works, all generated execution rows must be soft-deleted.
            await tx
                .update(estimateExecutionRows)
                .set({ deletedAt: new Date(), updatedAt: new Date() })
                .where(
                    and(
                        eq(estimateExecutionRows.estimateId, estimateId),
                        eq(estimateExecutionRows.source, 'from_estimate'),
                        withActiveTenant(estimateExecutionRows, teamId),
                    ),
                );

            return;
        }

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

        const now = new Date();
        const values = plannedWorks.map((work) => {
            const plannedPrice = applyEstimateCoefficient(work.price, coefPercent);
            return {
                tenantId: teamId,
                estimateId,
                estimateRowId: work.id,
                source: 'from_estimate' as const,
                status: 'not_started' as const,
                code: work.code,
                name: work.name,
                unit: work.unit,
                plannedQty: work.qty,
                plannedPrice,
                plannedSum: plannedPrice * work.qty,
                actualQty: work.qty,
                actualPrice: work.price,
                actualSum: work.qty * work.price,
                order: work.order,
                updatedAt: now,
            };
        });

        await tx
            .insert(estimateExecutionRows)
            .values(values)
            .onConflictDoUpdate({
                target: [estimateExecutionRows.estimateId, estimateExecutionRows.estimateRowId],
                targetWhere: sql`estimate_row_id IS NOT NULL AND deleted_at IS NULL`,
                set: {
                    deletedAt: null,
                    code: sql`excluded.code`,
                    name: sql`excluded.name`,
                    unit: sql`excluded.unit`,
                    plannedQty: sql`excluded.planned_qty`,
                    plannedPrice: sql`excluded.planned_price`,
                    plannedSum: sql`excluded.planned_sum`,
                    actualPrice: sql`excluded.actual_price`,
                    actualSum: sql`${estimateExecutionRows.actualQty} * excluded.actual_price`,
                    order: sql`excluded."order"`,
                    updatedAt: sql`now()`,
                },
            });
    }

    static async bumpSyncVersion(teamId: number, estimateId: string): Promise<void> {
        await db
            .update(estimates)
            .set({
                executionSyncVersion: sql`${estimates.executionSyncVersion} + 1`,
                updatedAt: new Date(),
            })
            .where(and(eq(estimates.id, estimateId), withActiveTenant(estimates, teamId)));
    }

    static async syncEstimateIfStale(teamId: number, estimateId: string, options?: { refreshProjectProgress?: boolean }): Promise<void> {
        const hasExecutionTable = await ensureExecutionStorageReady();
        if (!hasExecutionTable) {
            return;
        }

        const shouldRefreshProgress = options?.refreshProjectProgress ?? false;

        const syncResult = await db.transaction(async (tx) => {
            const lockedEstimateRows = await tx.execute(sql<{
                id: string;
                project_id: string;
                coef_percent: number;
                execution_sync_version: number;
                execution_synced_version: number;
            }>`
                SELECT id, project_id, coef_percent, execution_sync_version, execution_synced_version
                FROM estimates
                WHERE id = ${estimateId}
                  AND tenant_id = ${teamId}
                  AND deleted_at IS NULL
                FOR UPDATE
            `);
            const [lockedEstimate] = lockedEstimateRows as unknown as Array<{
                id: string;
                project_id: string;
                coef_percent: number;
                execution_sync_version: number;
                execution_synced_version: number;
            }>;

            if (!lockedEstimate) {
                return null;
            }

            const nextVersion = lockedEstimate.execution_sync_version ?? 0;
            const syncedVersion = lockedEstimate.execution_synced_version ?? 0;
            if (syncedVersion >= nextVersion) {
                return { projectId: lockedEstimate.project_id, synced: false };
            }

            await this.syncFromEstimateWorks(tx, teamId, estimateId, lockedEstimate.coef_percent ?? 0);

            await tx
                .update(estimates)
                .set({ executionSyncedVersion: nextVersion, updatedAt: new Date() })
                .where(and(eq(estimates.id, estimateId), withActiveTenant(estimates, teamId)));

            return { projectId: lockedEstimate.project_id, synced: true };
        });

        if (shouldRefreshProgress && syncResult?.synced) {
            await ProjectProgressService.refreshForProject(teamId, syncResult.projectId);
        }
    }

    static async runStaleSyncSafetyJob(limit = 50): Promise<number> {
        const staleEstimates = await db
            .select({
                id: estimates.id,
                tenantId: estimates.tenantId,
            })
            .from(estimates)
            .where(and(isNull(estimates.deletedAt), sql`${estimates.executionSyncedVersion} < ${estimates.executionSyncVersion}`))
            .limit(limit);

        const concurrency = 10;
        for (let i = 0; i < staleEstimates.length; i += concurrency) {
            const chunk = staleEstimates.slice(i, i + concurrency);
            await Promise.all(chunk.map((estimate) => this.syncEstimateIfStale(estimate.tenantId, estimate.id)));
        }

        return staleEstimates.length;
    }

    static async list(teamId: number, estimateId: string): Promise<Result<EstimateExecutionRow[]>> {
        try {
            const estimate = await ensureEstimateAccess(teamId, estimateId);
            if (!estimate) {
                return error('Смета не найдена', 'NOT_FOUND');
            }

            const hasExecutionTable = await ensureExecutionStorageReady();
            if (!hasExecutionTable) {
                return error('Требуется применить миграции БД для вкладки «Выполнение». Обратитесь к администратору.', 'MIGRATION_REQUIRED');
            }

            const currentVersion = estimate.executionSyncVersion ?? 0;
            const syncedVersion = estimate.executionSyncedVersion ?? 0;
            if (syncedVersion < currentVersion) {
                await this.syncEstimateIfStale(teamId, estimateId);
            }

            const rows = await db
                .select(estimateExecutionRowSelect)
                .from(estimateExecutionRows)
                .where(and(eq(estimateExecutionRows.estimateId, estimateId), withActiveTenant(estimateExecutionRows, teamId)))
                .orderBy(asc(estimateExecutionRows.order));

            return success(rows as EstimateExecutionRow[]);
        } catch (e) {
            if (isMissingRelationError(e) && e.code === '42P01') {
                const hasExecutionTable = await ensureExecutionStorageReady();
                if (hasExecutionTable) {
                    return this.list(teamId, estimateId);
                }

                return error('Требуется применить миграции БД для вкладки «Выполнение». Обратитесь к администратору.', 'MIGRATION_REQUIRED');
            }

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

            const hasExecutionTable = await ensureExecutionStorageReady();
            if (!hasExecutionTable) {
                return error('Требуется применить миграции БД для вкладки «Выполнение». Обратитесь к администратору.', 'MIGRATION_REQUIRED');
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
                    .where(and(eq(estimateExecutionRows.id, executionRowId), withActiveTenant(estimateExecutionRows, teamId)))
                    .returning(estimateExecutionRowSelect);

                if (!row) {
                    throw new Error('FAILED_TO_UPDATE');
                }

                return row;
            });

            await ProjectProgressService.refreshForProject(teamId, estimate.projectId);
            invalidateHomeDashboardCache(teamId);

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

            const hasExecutionTable = await ensureExecutionStorageReady();
            if (!hasExecutionTable) {
                return error('Требуется применить миграции БД для вкладки «Выполнение». Обратитесь к администратору.', 'MIGRATION_REQUIRED');
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

            await ProjectProgressService.refreshForProject(teamId, estimate.projectId);
            invalidateHomeDashboardCache(teamId);

            return success(created as EstimateExecutionRow);
        } catch (e) {
            console.error('EstimateExecutionService.addExtraWork error:', e);
            return error('Ошибка при добавлении дополнительной работы');
        }
    }
}
