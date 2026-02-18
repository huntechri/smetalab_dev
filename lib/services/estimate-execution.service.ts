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

const bootstrapExecutionStorage = async () => {
    await db.execute(sql.raw(`
DO $$ BEGIN
  CREATE TYPE "public"."estimate_execution_source" AS ENUM('from_estimate', 'extra');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
`));

    await db.execute(sql.raw(`
DO $$ BEGIN
  CREATE TYPE "public"."estimate_execution_status" AS ENUM('not_started', 'in_progress', 'done');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
`));

    await db.execute(sql.raw(`
CREATE TABLE IF NOT EXISTS "estimate_execution_rows" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" integer NOT NULL,
  "estimate_id" uuid NOT NULL,
  "estimate_row_id" uuid,
  "source" "estimate_execution_source" DEFAULT 'from_estimate' NOT NULL,
  "status" "estimate_execution_status" DEFAULT 'not_started' NOT NULL,
  "code" varchar(120) DEFAULT '' NOT NULL,
  "name" text NOT NULL,
  "unit" varchar(50) DEFAULT 'шт' NOT NULL,
  "planned_qty" double precision DEFAULT 0 NOT NULL,
  "planned_price" double precision DEFAULT 0 NOT NULL,
  "planned_sum" double precision DEFAULT 0 NOT NULL,
  "actual_qty" double precision DEFAULT 0 NOT NULL,
  "actual_price" double precision DEFAULT 0 NOT NULL,
  "actual_sum" double precision DEFAULT 0 NOT NULL,
  "is_completed" boolean DEFAULT false NOT NULL,
  "completed_at" timestamp,
  "completed_by_user_id" integer,
  "order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp
);
`));

    await db.execute(sql.raw(`
DO $$ BEGIN
 ALTER TABLE "estimate_execution_rows" ADD CONSTRAINT "estimate_execution_rows_tenant_id_teams_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
`));

    await db.execute(sql.raw(`
DO $$ BEGIN
 ALTER TABLE "estimate_execution_rows" ADD CONSTRAINT "estimate_execution_rows_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
`));

    await db.execute(sql.raw(`
DO $$ BEGIN
 ALTER TABLE "estimate_execution_rows" ADD CONSTRAINT "estimate_execution_rows_estimate_row_id_estimate_rows_id_fk" FOREIGN KEY ("estimate_row_id") REFERENCES "public"."estimate_rows"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
`));

    await db.execute(sql.raw(`
DO $$ BEGIN
 ALTER TABLE "estimate_execution_rows" ADD CONSTRAINT "estimate_execution_rows_completed_by_user_id_users_id_fk" FOREIGN KEY ("completed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
`));

    await db.execute(sql.raw(`
CREATE UNIQUE INDEX IF NOT EXISTS "estimate_execution_rows_estimate_row_unique" ON "estimate_execution_rows" USING btree ("estimate_id","estimate_row_id") WHERE estimate_row_id IS NOT NULL AND deleted_at IS NULL;
`));

    await db.execute(sql.raw(`
CREATE INDEX IF NOT EXISTS "estimate_execution_rows_tenant_estimate_idx" ON "estimate_execution_rows" USING btree ("tenant_id","estimate_id") WHERE deleted_at IS NULL;
`));

    await db.execute(sql.raw(`
CREATE INDEX IF NOT EXISTS "estimate_execution_rows_estimate_order_idx" ON "estimate_execution_rows" USING btree ("estimate_id","order") WHERE deleted_at IS NULL;
`));

    await db.execute(sql.raw(`
CREATE INDEX IF NOT EXISTS "estimate_execution_rows_estimate_status_idx" ON "estimate_execution_rows" USING btree ("estimate_id","status") WHERE deleted_at IS NULL;
`));
};

const ensureExecutionStorageReady = async () => {
    const exists = await checkExecutionTableExists();
    if (exists) {
        return true;
    }

    try {
        await bootstrapExecutionStorage();
    } catch (bootstrapError) {
        console.error('EstimateExecutionService.bootstrapExecutionStorage error:', bootstrapError);
    }

    return checkExecutionTableExists();
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

            const hasExecutionTable = await ensureExecutionStorageReady();
            if (!hasExecutionTable) {
                return error('Не удалось автоматически применить структуру БД для вкладки «Выполнение». Обратитесь к администратору.', 'MIGRATION_REQUIRED');
            }

            await this.syncFromEstimateWorks(teamId, estimateId);

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

                return error('Не удалось автоматически применить структуру БД для вкладки «Выполнение». Обратитесь к администратору.', 'MIGRATION_REQUIRED');
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
                return error('Не удалось автоматически применить структуру БД для вкладки «Выполнение». Обратитесь к администратору.', 'MIGRATION_REQUIRED');
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

            const hasExecutionTable = await ensureExecutionStorageReady();
            if (!hasExecutionTable) {
                return error('Не удалось автоматически применить структуру БД для вкладки «Выполнение». Обратитесь к администратору.', 'MIGRATION_REQUIRED');
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
