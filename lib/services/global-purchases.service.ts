import { and, asc, between, eq, inArray, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/data/db/drizzle';
import { withActiveTenant } from '@/lib/data/db/queries';
import { globalPurchases, materialSuppliers, materials, projects } from '@/lib/data/db/schema';
import { getTodayIsoLocal, addDaysToIsoDate } from '@/features/global-purchases/lib/date';
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
  supplierId: z.string().uuid().nullable().optional(),
  projectName: z.string().trim().max(160).default(''),
  materialName: z.string().trim().max(240).default(''),
  materialId: z.string().uuid().nullable().optional(),
  unit: z.string().trim().max(20).default('шт'),
  qty: nonNegative.default(1),
  price: nonNegative.default(0),
  note: z.string().trim().max(500).default(''),
  source: z.enum(['manual', 'catalog']).default('manual'),
  purchaseDate: isoDateSchema.optional(),
});

const patchSchema = z.object({
  projectId: z.string().uuid().nullable().optional(),
  supplierId: z.string().uuid().nullable().optional(),
  materialName: z.string().trim().max(240).optional(),
  materialId: z.string().uuid().nullable().optional(),
  unit: z.string().trim().max(20).optional(),
  qty: nonNegative.optional(),
  price: nonNegative.optional(),
  note: z.string().trim().max(500).optional(),
  purchaseDate: isoDateSchema.optional(),
});

const importRowSchema = z.object({
  purchaseDate: isoDateSchema,
  projectName: z.string().trim().max(160),
  materialName: z.string().trim().min(1).max(240),
  materialId: z.string().uuid().nullable().optional(),
  unit: z.string().trim().min(1).max(20),
  qty: nonNegative,
  price: nonNegative,
  note: z.string().trim().max(500),
  supplierName: z.string().trim().max(160),
});

const importSchema = z.object({
  rows: z.array(importRowSchema).min(1).max(1000),
});

const batchPatchSchema = z.object({
  updates: z.array(z.object({
    rowId: z.string().uuid(),
    patch: patchSchema,
  })).min(1).max(500),
});

const calculateAmount = (qty: number, price: number) => Math.round((qty * price + Number.EPSILON) * 100) / 100;
const normalizeLookupName = (value: string) => value.trim().toLocaleLowerCase('ru-RU');

const toRow = (
  row: typeof globalPurchases.$inferSelect,
  projectName: string | null,
  supplier: { name: string; color: string } | null
): PurchaseRow => ({
  id: row.id,
  projectId: row.projectId,
  projectName: projectName ?? row.projectName,
  materialName: row.materialName,
  materialId: row.materialId,
  unit: row.unit,
  qty: row.qty,
  price: row.price,
  amount: row.amount,
  note: row.note,
  source: row.source,
  purchaseDate: row.purchaseDate,
  supplierId: row.supplierId,
  supplierName: supplier?.name ?? null,
  supplierColor: supplier?.color ?? null,
});

type DbLike = Pick<typeof db, 'query'>;

const resolveProject = async (client: DbLike, teamId: number, projectId: string) => client.query.projects.findFirst({
  where: and(eq(projects.id, projectId), withActiveTenant(projects, teamId)),
  columns: { id: true, name: true },
});

const resolveSupplier = async (client: DbLike, teamId: number, supplierId: string) => client.query.materialSuppliers.findFirst({
  where: and(eq(materialSuppliers.id, supplierId), withActiveTenant(materialSuppliers, teamId)),
  columns: { id: true, name: true, color: true },
});

type ProjectSnapshot = { id: string; name: string };
type SupplierSnapshot = { id: string; name: string; color: string };

const getCachedProject = async (
  client: DbLike,
  teamId: number,
  projectId: string,
  cache: Map<string, ProjectSnapshot | null>
) => {
  if (cache.has(projectId)) {
    return cache.get(projectId) ?? null;
  }

  const project = await resolveProject(client, teamId, projectId);
  cache.set(projectId, project ?? null);
  return project ?? null;
};

const getCachedSupplier = async (
  client: DbLike,
  teamId: number,
  supplierId: string,
  cache: Map<string, SupplierSnapshot | null>
) => {
  if (cache.has(supplierId)) {
    return cache.get(supplierId) ?? null;
  }

  const supplier = await resolveSupplier(client, teamId, supplierId);
  cache.set(supplierId, supplier ?? null);
  return supplier ?? null;
};

export class GlobalPurchasesService {
  static async list(teamId: number, rawFilters: unknown): Promise<Result<PurchaseRow[]>> {
    const parsed = listSchema.safeParse(rawFilters);
    if (!parsed.success) return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');
    if (parsed.data.from > parsed.data.to) return error('Некорректный период: дата начала больше даты окончания', 'VALIDATION_ERROR');

    try {
      const rows = await db
        .select({
          row: globalPurchases,
          projectName: projects.name,
          supplierName: materialSuppliers.name,
          supplierColor: materialSuppliers.color,
        })
        .from(globalPurchases)
        .leftJoin(projects, and(eq(globalPurchases.projectId, projects.id), withActiveTenant(projects, teamId)))
        .leftJoin(materialSuppliers, and(eq(globalPurchases.supplierId, materialSuppliers.id), withActiveTenant(materialSuppliers, teamId)))
        .where(and(
          withActiveTenant(globalPurchases, teamId),
          between(globalPurchases.purchaseDate, parsed.data.from, parsed.data.to),
        ))
        .orderBy(asc(globalPurchases.purchaseDate), asc(globalPurchases.order), asc(globalPurchases.createdAt));

      return success(rows.map(({ row, projectName, supplierName, supplierColor }) =>
        toRow(row, projectName, supplierName && supplierColor ? { name: supplierName, color: supplierColor } : null)
      ));
    } catch (serviceError) {
      console.error('GlobalPurchasesService.list error', serviceError);
      return error('Не удалось загрузить закупки');
    }
  }

  static async create(teamId: number, rawPayload: unknown): Promise<Result<PurchaseRow>> {
    const parsed = createSchema.safeParse(rawPayload);
    if (!parsed.success) return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');

    try {
      const created = await db.transaction(async (tx) => {
        const payload = parsed.data;
        const purchaseDate = payload.purchaseDate ?? getTodayIsoLocal();

        const [{ maxOrder }] = await tx
          .select({ maxOrder: sql<number>`COALESCE(MAX(${globalPurchases.order}), 0)` })
          .from(globalPurchases)
          .where(and(withActiveTenant(globalPurchases, teamId), eq(globalPurchases.purchaseDate, purchaseDate)));

        const project = payload.projectId ? await resolveProject(tx, teamId, payload.projectId) : null;
        if (payload.projectId && !project) throw new Error('PROJECT_NOT_FOUND');

        const supplier = payload.supplierId ? await resolveSupplier(tx, teamId, payload.supplierId) : null;
        if (payload.supplierId && !supplier) throw new Error('SUPPLIER_NOT_FOUND');

        const [row] = await tx.insert(globalPurchases).values({
          tenantId: teamId,
          projectId: project?.id ?? null,
          supplierId: supplier?.id ?? null,
          projectName: project?.name ?? payload.projectName,
          materialName: payload.materialName,
          materialId: payload.materialId ?? null,
          unit: payload.unit,
          qty: payload.qty,
          price: payload.price,
          amount: calculateAmount(payload.qty, payload.price),
          note: payload.note,
          source: payload.source,
          purchaseDate,
          order: maxOrder + 1,
        }).returning();

        return { row, projectName: project?.name ?? null, supplier };
      });

      return success(toRow(created.row, created.projectName, created.supplier ?? null));
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'PROJECT_NOT_FOUND') return error('Проект не найден', 'NOT_FOUND');
        if (serviceError.message === 'SUPPLIER_NOT_FOUND') return error('Поставщик не найден', 'NOT_FOUND');
      }
      console.error('GlobalPurchasesService.create error', serviceError);
      return error('Не удалось создать строку закупки');
    }
  }

  static async patch(teamId: number, rowId: string, rawPatch: unknown): Promise<Result<PurchaseRow>> {
    const parsed = patchSchema.safeParse(rawPatch);
    if (!parsed.success) return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');

    try {
      const result = await db.transaction(async (tx) => {
        const existing = await tx.query.globalPurchases.findFirst({
          where: and(eq(globalPurchases.id, rowId), withActiveTenant(globalPurchases, teamId)),
        });

        if (!existing) throw new Error('NOT_FOUND');

        const patch = parsed.data;
        const nextQty = patch.qty ?? existing.qty;
        const nextPrice = patch.price ?? existing.price;

        const project = patch.projectId !== undefined && patch.projectId !== null
          ? await resolveProject(tx, teamId, patch.projectId)
          : null;
        if (patch.projectId && !project) throw new Error('PROJECT_NOT_FOUND');

        const resolvedSupplier = patch.supplierId === undefined
          ? (existing.supplierId ? await resolveSupplier(tx, teamId, existing.supplierId) : null)
          : (patch.supplierId ? await resolveSupplier(tx, teamId, patch.supplierId) : null);

        if (patch.supplierId && !resolvedSupplier) throw new Error('SUPPLIER_NOT_FOUND');

        const [updated] = await tx.update(globalPurchases)
          .set({
            materialName: patch.materialName,
            materialId: patch.materialId !== undefined ? patch.materialId : existing.materialId,
            unit: patch.unit,
            note: patch.note,
            purchaseDate: patch.purchaseDate,
            projectId: patch.projectId !== undefined ? patch.projectId : existing.projectId,
            projectName: project?.name ?? existing.projectName,
            supplierId: patch.supplierId !== undefined ? patch.supplierId : existing.supplierId,
            qty: nextQty,
            price: nextPrice,
            amount: calculateAmount(nextQty, nextPrice),
            updatedAt: new Date(),
          })
          .where(and(eq(globalPurchases.id, rowId), withActiveTenant(globalPurchases, teamId)))
          .returning();

        return {
          row: updated,
          projectName: project?.name ?? updated.projectName,
          supplier: patch.supplierId === null ? null : resolvedSupplier,
        };
      });

      return success(toRow(result.row, result.projectName, result.supplier ?? null));
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'NOT_FOUND') return error('Строка закупки не найдена', 'NOT_FOUND');
        if (serviceError.message === 'PROJECT_NOT_FOUND') return error('Проект не найден', 'NOT_FOUND');
        if (serviceError.message === 'SUPPLIER_NOT_FOUND') return error('Поставщик не найден', 'NOT_FOUND');
      }
      console.error('GlobalPurchasesService.patch error', serviceError);
      return error('Не удалось обновить строку закупки');
    }
  }

  static async patchBatch(teamId: number, rawPayload: unknown): Promise<Result<PurchaseRow[]>> {
    const parsed = batchPatchSchema.safeParse(rawPayload);
    if (!parsed.success) return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');

    try {
      const rows = await db.transaction(async (tx) => {
        const uniqueRowIds = [...new Set(parsed.data.updates.map((update) => update.rowId))];
        const existingRows = await tx.query.globalPurchases.findMany({
          where: and(inArray(globalPurchases.id, uniqueRowIds), withActiveTenant(globalPurchases, teamId)),
        });

        if (existingRows.length !== uniqueRowIds.length) {
          throw new Error('NOT_FOUND');
        }

        const existingMap = new Map(existingRows.map((row) => [row.id, row]));
        const projectCache = new Map<string, ProjectSnapshot | null>();
        const supplierCache = new Map<string, SupplierSnapshot | null>();
        const updatesByRowId = new Map<string, (typeof parsed.data.updates)[number]>();
        for (const update of parsed.data.updates) {
          updatesByRowId.set(update.rowId, update);
        }

        const preparedUpdates: Array<{
          rowId: string;
          materialName: string;
          materialId: string | null;
          unit: string;
          note: string;
          purchaseDate: string;
          projectId: string | null;
          projectName: string;
          supplierId: string | null;
          qty: number;
          price: number;
          amount: number;
        }> = [];

        for (const update of updatesByRowId.values()) {
          const existing = existingMap.get(update.rowId);
          if (!existing) {
            throw new Error('NOT_FOUND');
          }

          const patch = update.patch;
          const nextQty = patch.qty ?? existing.qty;
          const nextPrice = patch.price ?? existing.price;

          const project = patch.projectId !== undefined && patch.projectId !== null
            ? await getCachedProject(tx, teamId, patch.projectId, projectCache)
            : null;

          if (patch.projectId && !project) {
            throw new Error('PROJECT_NOT_FOUND');
          }

          if (patch.supplierId) {
            const supplier = await getCachedSupplier(tx, teamId, patch.supplierId, supplierCache);
            if (!supplier) {
              throw new Error('SUPPLIER_NOT_FOUND');
            }
          }

          preparedUpdates.push({
            rowId: update.rowId,
            materialName: patch.materialName ?? existing.materialName,
            materialId: patch.materialId !== undefined ? patch.materialId : existing.materialId,
            unit: patch.unit ?? existing.unit,
            note: patch.note ?? existing.note,
            purchaseDate: patch.purchaseDate ?? existing.purchaseDate,
            projectId: patch.projectId !== undefined ? patch.projectId : existing.projectId,
            projectName: project?.name ?? existing.projectName,
            supplierId: patch.supplierId !== undefined ? patch.supplierId : existing.supplierId,
            qty: nextQty,
            price: nextPrice,
            amount: calculateAmount(nextQty, nextPrice),
          });
        }

        const updatedRows: typeof globalPurchases.$inferSelect[] = [];
        for (const prepared of preparedUpdates) {
          const [updated] = await tx.update(globalPurchases)
            .set({
              materialName: prepared.materialName,
              materialId: prepared.materialId,
              unit: prepared.unit,
              note: prepared.note,
              purchaseDate: prepared.purchaseDate,
              projectId: prepared.projectId,
              projectName: prepared.projectName,
              supplierId: prepared.supplierId,
              qty: prepared.qty,
              price: prepared.price,
              amount: prepared.amount,
              updatedAt: new Date(),
            })
            .where(and(eq(globalPurchases.id, prepared.rowId), withActiveTenant(globalPurchases, teamId)))
            .returning();

          if (!updated) {
            throw new Error('NOT_FOUND');
          }

          updatedRows.push(updated);
        }

        const updatedMap = new Map(updatedRows.map((row) => [row.id, row]));
        const orderedUpdatedRows = preparedUpdates.map((row) => {
          const updated = updatedMap.get(row.rowId);
          if (!updated) {
            throw new Error('NOT_FOUND');
          }
          return updated;
        });

        const projectIds = [...new Set(orderedUpdatedRows.map((row) => row.projectId).filter((id): id is string => !!id))];
        const supplierIds = [...new Set(orderedUpdatedRows.map((row) => row.supplierId).filter((id): id is string => !!id))];

        const projectsList = projectIds.length > 0
          ? await tx.query.projects.findMany({
            where: and(inArray(projects.id, projectIds), withActiveTenant(projects, teamId)),
            columns: { id: true, name: true },
          })
          : [];

        const suppliersList = supplierIds.length > 0
          ? await tx.query.materialSuppliers.findMany({
            where: and(inArray(materialSuppliers.id, supplierIds), withActiveTenant(materialSuppliers, teamId)),
            columns: { id: true, name: true, color: true },
          })
          : [];

        const projectMap = new Map(projectsList.map((project) => [project.id, project.name]));
        const supplierMap = new Map(suppliersList.map((supplier) => [supplier.id, { name: supplier.name, color: supplier.color }]));

        return orderedUpdatedRows.map((row) => toRow(
          row,
          row.projectId ? projectMap.get(row.projectId) ?? null : null,
          row.supplierId ? supplierMap.get(row.supplierId) ?? null : null
        ));
      });

      return success(rows);
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'NOT_FOUND') return error('Строка закупки не найдена', 'NOT_FOUND');
        if (serviceError.message === 'PROJECT_NOT_FOUND') return error('Проект не найден', 'NOT_FOUND');
        if (serviceError.message === 'SUPPLIER_NOT_FOUND') return error('Поставщик не найден', 'NOT_FOUND');
      }
      console.error('GlobalPurchasesService.patchBatch error', serviceError);
      return error('Не удалось массово обновить строки закупки');
    }
  }


  static async importRows(teamId: number, rawPayload: unknown): Promise<Result<PurchaseRow[]>> {
    const parsed = importSchema.safeParse(rawPayload);
    if (!parsed.success) return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');

    try {
      const importedRows = await db.transaction(async (tx) => {
        const projectList = await tx.query.projects.findMany({
          where: withActiveTenant(projects, teamId),
          columns: { id: true, name: true },
        });

        const supplierList = await tx.query.materialSuppliers.findMany({
          where: withActiveTenant(materialSuppliers, teamId),
          columns: { id: true, name: true, color: true },
        });
        const materialsList = await tx.query.materials.findMany({
          where: withActiveTenant(materials, teamId),
          columns: { id: true, name: true },
        });

        const projectMapByName = new Map(projectList.map((project) => [normalizeLookupName(project.name), project]));
        const supplierMapByName = new Map(supplierList.map((supplier) => [normalizeLookupName(supplier.name), supplier]));
        const materialMapByName = new Map(materialsList.map((material) => [normalizeLookupName(material.name), material]));

        const groupedByDate = new Map<string, typeof parsed.data.rows>();
        for (const row of parsed.data.rows) {
          const group = groupedByDate.get(row.purchaseDate) ?? [];
          group.push(row);
          groupedByDate.set(row.purchaseDate, group);
        }

        const insertedRows: typeof globalPurchases.$inferSelect[] = [];
        const purchaseDates = [...groupedByDate.keys()];
        const maxOrdersByDate = purchaseDates.length > 0
          ? await tx
            .select({
              purchaseDate: globalPurchases.purchaseDate,
              maxOrder: sql<number>`COALESCE(MAX(${globalPurchases.order}), 0)`,
            })
            .from(globalPurchases)
            .where(and(withActiveTenant(globalPurchases, teamId), inArray(globalPurchases.purchaseDate, purchaseDates)))
            .groupBy(globalPurchases.purchaseDate)
          : [];
        const maxOrderByDate = new Map(maxOrdersByDate.map((row) => [row.purchaseDate, row.maxOrder]));

        for (const [purchaseDate, rows] of groupedByDate.entries()) {
          const maxOrder = maxOrderByDate.get(purchaseDate) ?? 0;

          const values = rows.map((row, index) => {
            const project = projectMapByName.get(normalizeLookupName(row.projectName));
            const supplier = row.supplierName
              ? supplierMapByName.get(normalizeLookupName(row.supplierName))
              : null;
            const matchedMaterial = materialMapByName.get(normalizeLookupName(row.materialName));
            const resolvedMaterialId = row.materialId ?? matchedMaterial?.id ?? null;

            return {
              tenantId: teamId,
              projectId: project?.id ?? null,
              supplierId: supplier?.id ?? null,
              projectName: project?.name ?? row.projectName,
              materialName: row.materialName,
              materialId: resolvedMaterialId,
              unit: row.unit,
              qty: row.qty,
              price: row.price,
              amount: calculateAmount(row.qty, row.price),
              note: row.note,
              source: 'manual' as const,
              purchaseDate: row.purchaseDate,
              order: maxOrder + index + 1,
            };
          });

          const inserted = await tx.insert(globalPurchases).values(values).returning();
          insertedRows.push(...inserted);
        }

        const projectMap = new Map(projectList.map((project) => [project.id, project.name]));
        const supplierMap = new Map(supplierList.map((supplier) => [supplier.id, { name: supplier.name, color: supplier.color }]));

        return insertedRows.map((row) => toRow(
          row,
          row.projectId ? projectMap.get(row.projectId) ?? null : null,
          row.supplierId ? supplierMap.get(row.supplierId) ?? null : null
        ));
      });

      return success(importedRows);
    } catch (serviceError) {
      console.error('GlobalPurchasesService.importRows error', serviceError);
      return error('Не удалось импортировать строки закупки');
    }
  }

  static async remove(teamId: number, rowId: string): Promise<Result<{ removedId: string }>> {
    try {
      const [deleted] = await db.update(globalPurchases)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(globalPurchases.id, rowId), withActiveTenant(globalPurchases, teamId), isNull(globalPurchases.deletedAt)))
        .returning({ id: globalPurchases.id });

      if (!deleted) return error('Строка закупки не найдена', 'NOT_FOUND');
      return success({ removedId: deleted.id });
    } catch (serviceError) {
      console.error('GlobalPurchasesService.remove error', serviceError);
      return error('Не удалось удалить строку закупки');
    }
  }

  static async copyRowsToNextDay(teamId: number, sourceDate: string): Promise<Result<PurchaseRow[]>> {
    if (!isoDateSchema.safeParse(sourceDate).success) {
      return error('Некорректная дата источника', 'VALIDATION_ERROR');
    }

    const targetDate = addDaysToIsoDate(sourceDate, 1);

    try {
      const createdRows = await db.transaction(async (tx) => {
        const sourceRows = await tx.query.globalPurchases.findMany({
          where: and(eq(globalPurchases.purchaseDate, sourceDate), withActiveTenant(globalPurchases, teamId)),
          orderBy: [asc(globalPurchases.order), asc(globalPurchases.createdAt)],
        });

        if (sourceRows.length === 0) return [];

        const [{ maxOrder }] = await tx
          .select({ maxOrder: sql<number>`COALESCE(MAX(${globalPurchases.order}), 0)` })
          .from(globalPurchases)
          .where(and(withActiveTenant(globalPurchases, teamId), eq(globalPurchases.purchaseDate, targetDate)));

        const newRows = sourceRows.map((row, index) => ({
          tenantId: teamId,
          projectId: row.projectId,
          supplierId: row.supplierId,
          projectName: row.projectName,
          materialName: row.materialName,
          materialId: row.materialId,
          unit: row.unit,
          qty: row.qty,
          price: row.price,
          amount: row.amount,
          note: row.note,
          source: row.source,
          purchaseDate: targetDate,
          order: maxOrder + index + 1,
        }));

        const inserted = await tx.insert(globalPurchases).values(newRows).returning();

        const projectIds = [...new Set(inserted.map((r) => r.projectId).filter((id): id is string => !!id))];
        const supplierIds = [...new Set(inserted.map((r) => r.supplierId).filter((id): id is string => !!id))];

        const projectsList = projectIds.length > 0
          ? await tx.query.projects.findMany({
            where: and(inArray(projects.id, projectIds), withActiveTenant(projects, teamId)),
            columns: { id: true, name: true },
          })
          : [];

        const suppliersList = supplierIds.length > 0
          ? await tx.query.materialSuppliers.findMany({
            where: and(inArray(materialSuppliers.id, supplierIds), withActiveTenant(materialSuppliers, teamId)),
            columns: { id: true, name: true, color: true },
          })
          : [];

        const projectMap = new Map(projectsList.map((p) => [p.id, p.name]));
        const supplierMap = new Map(suppliersList.map((s) => [s.id, { name: s.name, color: s.color }]));

        return inserted.map((row) => toRow(
          row,
          row.projectId ? projectMap.get(row.projectId) ?? null : null,
          row.supplierId ? supplierMap.get(row.supplierId) ?? null : null
        ));
      });

      return success(createdRows);
    } catch (serviceError) {
      console.error('GlobalPurchasesService.copyRowsToNextDay error', serviceError);
      return error('Не удалось скопировать закупки на следующий день');
    }
  }
}
