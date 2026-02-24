import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/data/db/drizzle';
import { estimatePatterns, estimateRows } from '@/lib/data/db/schema';
import { withActiveTenant } from '@/lib/data/db/queries';
import { Result, error, success } from '@/lib/utils/result';

const createPatternSchema = z.object({
  estimateId: z.string().uuid(),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(500).optional(),
});

const applyPatternSchema = z.object({
  estimateId: z.string().uuid(),
  patternId: z.string().uuid(),
});

type PatternSnapshotRow = {
  kind: 'work' | 'material';
  parentWorkTempKey: string | null;
  tempKey: string;
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

type PatternSnapshot = { rows: PatternSnapshotRow[] };

export class EstimatePatternsService {
  static async list(teamId: number): Promise<Result<Array<{ id: string; name: string; description: string | null; rowsCount: number; worksCount: number; materialsCount: number; updatedAt: Date }>>> {
    try {
      const items = await db
        .select({
          id: estimatePatterns.id,
          name: estimatePatterns.name,
          description: estimatePatterns.description,
          rowsCount: estimatePatterns.rowsCount,
          worksCount: estimatePatterns.worksCount,
          materialsCount: estimatePatterns.materialsCount,
          updatedAt: estimatePatterns.updatedAt,
        })
        .from(estimatePatterns)
        .where(withActiveTenant(estimatePatterns, teamId))
        .orderBy(estimatePatterns.updatedAt);

      return success(items.reverse());
    } catch (e) {
      console.error('EstimatePatternsService.list error:', e);
      return error('Не удалось получить шаблоны');
    }
  }

  static async create(teamId: number, rawPayload: unknown): Promise<Result<{ id: string }>> {
    const parsed = createPatternSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return error('Некорректные данные шаблона', 'VALIDATION_ERROR');
    }

    try {
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
        .where(and(eq(estimateRows.estimateId, parsed.data.estimateId), withActiveTenant(estimateRows, teamId)));

      if (rows.length === 0) {
        return error('Невозможно сохранить пустую смету как шаблон', 'VALIDATION_ERROR');
      }

      const snapshotRows: PatternSnapshotRow[] = rows.map((row) => ({
        kind: row.kind,
        parentWorkTempKey: row.parentWorkId,
        tempKey: row.id,
        code: row.code,
        name: row.name,
        materialId: row.materialId,
        imageUrl: row.imageUrl,
        unit: row.unit,
        qty: row.qty,
        price: row.price,
        sum: row.sum,
        expense: row.expense,
        order: row.order,
      }));

      const [created] = await db
        .insert(estimatePatterns)
        .values({
          tenantId: teamId,
          name: parsed.data.name,
          description: parsed.data.description?.trim() || null,
          rowsCount: snapshotRows.length,
          worksCount: snapshotRows.filter((row) => row.kind === 'work').length,
          materialsCount: snapshotRows.filter((row) => row.kind === 'material').length,
          snapshot: { rows: snapshotRows },
        })
        .returning({ id: estimatePatterns.id });

      return success(created);
    } catch (e) {
      console.error('EstimatePatternsService.create error:', e);
      return error('Не удалось сохранить шаблон');
    }
  }

  static async preview(teamId: number, patternId: string): Promise<Result<{ id: string; name: string; rows: PatternSnapshotRow[] }>> {
    try {
      const item = await db.query.estimatePatterns.findFirst({
        where: and(eq(estimatePatterns.id, patternId), withActiveTenant(estimatePatterns, teamId)),
      });

      if (!item) {
        return error('Шаблон не найден', 'NOT_FOUND');
      }

      const snapshot = item.snapshot as PatternSnapshot;
      const sortedRows = [...snapshot.rows].sort((a, b) => a.order - b.order);
      return success({
        id: item.id,
        name: item.name,
        rows: sortedRows,
      });
    } catch (e) {
      console.error('EstimatePatternsService.preview error:', e);
      return error('Не удалось загрузить шаблон');
    }
  }

  static async apply(teamId: number, rawPayload: unknown): Promise<Result<{ appliedRows: number }>> {
    const parsed = applyPatternSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return error('Некорректные параметры применения шаблона', 'VALIDATION_ERROR');
    }

    try {
      const pattern = await db.query.estimatePatterns.findFirst({
        where: and(eq(estimatePatterns.id, parsed.data.patternId), withActiveTenant(estimatePatterns, teamId)),
      });

      if (!pattern) {
        return error('Шаблон не найден', 'NOT_FOUND');
      }

      const snapshot = pattern.snapshot as PatternSnapshot;

      await db.transaction(async (tx) => {
        await tx
          .update(estimateRows)
          .set({ deletedAt: new Date(), updatedAt: new Date() })
          .where(and(eq(estimateRows.estimateId, parsed.data.estimateId), withActiveTenant(estimateRows, teamId)));

        const works = snapshot.rows.filter((row) => row.kind === 'work');
        const workCodeMap = new Map<string, string>();

        for (const row of works) {
          const [createdWork] = await tx
            .insert(estimateRows)
            .values({
              tenantId: teamId,
              estimateId: parsed.data.estimateId,
              kind: 'work',
              code: row.code,
              name: row.name,
              unit: row.unit,
              qty: row.qty,
              price: row.price,
              sum: row.sum,
              expense: row.expense,
              order: row.order,
            })
            .returning({ id: estimateRows.id });

          workCodeMap.set(row.tempKey, createdWork.id);
        }

        const materials = snapshot.rows.filter((row) => row.kind === 'material');
        if (materials.length > 0) {
          await tx.insert(estimateRows).values(materials.map((row) => ({
            tenantId: teamId,
            estimateId: parsed.data.estimateId,
            kind: 'material' as const,
            parentWorkId: row.parentWorkTempKey ? workCodeMap.get(row.parentWorkTempKey) ?? null : null,
            code: row.code,
            name: row.name,
            materialId: row.materialId,
            imageUrl: row.imageUrl,
            unit: row.unit,
            qty: row.qty,
            price: row.price,
            sum: row.sum,
            expense: row.expense,
            order: row.order,
          })));
        }
      });

      return success({ appliedRows: snapshot.rows.length });
    } catch (e) {
      console.error('EstimatePatternsService.apply error:', e);
      return error('Не удалось применить шаблон');
    }
  }

  static async remove(teamId: number, patternId: string): Promise<Result<{ id: string }>> {
    try {
      const [removed] = await db
        .update(estimatePatterns)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(estimatePatterns.id, patternId), withActiveTenant(estimatePatterns, teamId)))
        .returning({ id: estimatePatterns.id });

      if (!removed) {
        return error('Шаблон не найден', 'NOT_FOUND');
      }

      return success(removed);
    } catch (e) {
      console.error('EstimatePatternsService.remove error:', e);
      return error('Не удалось удалить шаблон');
    }
  }
}
