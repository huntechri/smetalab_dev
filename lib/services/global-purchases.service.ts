import { and, asc, between, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/data/db/drizzle';
import { withActiveTenant } from '@/lib/data/db/queries';
import { globalPurchases, projects } from '@/lib/data/db/schema';
import { getTodayIsoLocal } from '@/features/global-purchases/lib/date';
import { error, Result, success } from '@/lib/utils/result';
import type { PurchaseRow } from '@/features/global-purchases/types/dto';

const nonNegative = z.number().finite().min(0);
const isoDateSchema = z.string().date();

const listSchema = z.object({
    from: isoDateSchema,
    to: isoDateSchema,
});

const createSchema = z.object({
    projectId: z.string().uuid().nullable().optional(),
    projectName: z.string().trim().max(160).default(''),
    materialName: z.string().trim().max(240).default(''),
    unit: z.string().trim().max(20).default('шт'),
    qty: nonNegative.default(1),
    price: nonNegative.default(0),
    note: z.string().trim().max(500).default(''),
    source: z.enum(['manual', 'catalog']).default('manual'),
    purchaseDate: isoDateSchema.optional(),
});

const patchSchema = z.object({
    projectId: z.string().uuid().nullable().optional(),
    materialName: z.string().trim().max(240).optional(),
    unit: z.string().trim().max(20).optional(),
    qty: nonNegative.optional(),
    price: nonNegative.optional(),
    note: z.string().trim().max(500).optional(),
    purchaseDate: isoDateSchema.optional(),
});

const calculateAmount = (qty: number, price: number) => Math.round((qty * price + Number.EPSILON) * 100) / 100;

const toRow = (row: typeof globalPurchases.$inferSelect, projectName: string | null): PurchaseRow => ({
    id: row.id,
    projectId: row.projectId,
    projectName: projectName ?? row.projectName,
    materialName: row.materialName,
    unit: row.unit,
    qty: row.qty,
    price: row.price,
    amount: row.amount,
    note: row.note,
    source: row.source,
    purchaseDate: row.purchaseDate,
});

type DbLike = Pick<typeof db, 'query'>;

const resolveProject = async (client: DbLike, teamId: number, projectId: string) => client.query.projects.findFirst({
    where: and(eq(projects.id, projectId), withActiveTenant(projects, teamId)),
    columns: {
        id: true,
        name: true,
    },
});

export class GlobalPurchasesService {
    static async list(teamId: number, rawFilters: unknown): Promise<Result<PurchaseRow[]>> {
        const parsed = listSchema.safeParse(rawFilters);
        if (!parsed.success) {
            return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');
        }

        if (parsed.data.from > parsed.data.to) {
            return error('Некорректный период: дата начала больше даты окончания', 'VALIDATION_ERROR');
        }

        try {
            const rows = await db
                .select({
                    row: globalPurchases,
                    projectName: projects.name,
                })
                .from(globalPurchases)
                .leftJoin(projects, and(eq(globalPurchases.projectId, projects.id), withActiveTenant(projects, teamId)))
                .where(and(
                    withActiveTenant(globalPurchases, teamId),
                    between(globalPurchases.purchaseDate, parsed.data.from, parsed.data.to),
                ))
                .orderBy(asc(globalPurchases.purchaseDate), asc(globalPurchases.order), asc(globalPurchases.createdAt));

            return success(rows.map(({ row, projectName }) => toRow(row, projectName)));
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
                const payload = parsed.data;
                const purchaseDate = payload.purchaseDate ?? getTodayIsoLocal();

                const [{ maxOrder }] = await tx
                    .select({ maxOrder: sql<number>`COALESCE(MAX(${globalPurchases.order}), 0)` })
                    .from(globalPurchases)
                    .where(and(withActiveTenant(globalPurchases, teamId), eq(globalPurchases.purchaseDate, purchaseDate)));

                const project = payload.projectId ? await resolveProject(tx, teamId, payload.projectId) : null;
                if (payload.projectId && !project) {
                    throw new Error('PROJECT_NOT_FOUND');
                }

                const [row] = await tx.insert(globalPurchases).values({
                    tenantId: teamId,
                    projectId: project?.id ?? null,
                    projectName: project?.name ?? payload.projectName,
                    materialName: payload.materialName,
                    unit: payload.unit,
                    qty: payload.qty,
                    price: payload.price,
                    amount: calculateAmount(payload.qty, payload.price),
                    note: payload.note,
                    source: payload.source,
                    purchaseDate,
                    order: maxOrder + 1,
                }).returning();

                return {
                    row,
                    projectName: project?.name ?? null,
                };
            });

            return success(toRow(created.row, created.projectName));
        } catch (serviceError) {
            if (serviceError instanceof Error && serviceError.message === 'PROJECT_NOT_FOUND') {
                return error('Проект не найден', 'NOT_FOUND');
            }

            console.error('GlobalPurchasesService.create error', serviceError);
            return error('Не удалось создать строку закупки');
        }
    }

    static async patch(teamId: number, rowId: string, rawPatch: unknown): Promise<Result<PurchaseRow>> {
        const parsed = patchSchema.safeParse(rawPatch);
        if (!parsed.success) {
            return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');
        }

        if (Object.keys(parsed.data).length === 0) {
            return error('Нет полей для обновления', 'VALIDATION_ERROR');
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

            const project = patch.projectId ? await resolveProject(db, teamId, patch.projectId) : null;
            if (patch.projectId && !project) {
                return error('Проект не найден', 'NOT_FOUND');
            }

            const [updated] = await db.update(globalPurchases)
                .set({
                    materialName: patch.materialName,
                    unit: patch.unit,
                    note: patch.note,
                    purchaseDate: patch.purchaseDate,
                    projectId: patch.projectId !== undefined ? patch.projectId : existing.projectId,
                    projectName: project?.name ?? existing.projectName,
                    qty: nextQty,
                    price: nextPrice,
                    amount: calculateAmount(nextQty, nextPrice),
                    updatedAt: new Date(),
                })
                .where(and(eq(globalPurchases.id, rowId), withActiveTenant(globalPurchases, teamId)))
                .returning();

            const resolvedProject = updated.projectId ? await resolveProject(db, teamId, updated.projectId) : null;

            return success(toRow(updated, resolvedProject?.name ?? null));
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
