import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/lib/data/db/drizzle';
import { withActiveTenant } from '@/lib/data/db/queries';
import { projectReceipts, projects } from '@/lib/data/db/schema';
import { Result, error, success } from '@/lib/utils/result';
import { invalidateHomeDashboardCache } from './home-dashboard-cache';

export const projectReceiptTypeSchema = z.enum([
  'advance',
  'stage_payment',
  'partial_payment',
  'final_payment',
  'additional_payment',
  'adjustment',
  'refund',
]);

export const projectReceiptStatusSchema = z.enum(['confirmed', 'pending', 'cancelled']);

const isoDateSchema = z.string().date();

const createProjectReceiptSchema = z.object({
  projectId: z.string().uuid(),
  date: isoDateSchema,
  amount: z.number().finite().refine((value) => value !== 0, 'Сумма не может быть равна 0'),
  type: projectReceiptTypeSchema,
  status: projectReceiptStatusSchema,
  comment: z.string().trim().max(500).default(''),
  source: z.string().trim().max(300).optional().nullable(),
});

const updateProjectReceiptSchema = z.object({
  date: isoDateSchema.optional(),
  amount: z.number().finite().refine((value) => value !== 0, 'Сумма не может быть равна 0').optional(),
  type: projectReceiptTypeSchema.optional(),
  status: projectReceiptStatusSchema.optional(),
  comment: z.string().trim().max(500).optional(),
  source: z.string().trim().max(300).optional().nullable(),
});

const receiptRangeSchema = z.object({
  from: isoDateSchema,
  to: isoDateSchema,
});

export type ProjectReceiptRow = {
  id: string;
  projectId: string;
  date: string;
  amount: number;
  type: z.infer<typeof projectReceiptTypeSchema>;
  status: z.infer<typeof projectReceiptStatusSchema>;
  comment: string;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectReceiptAggregates = {
  totalConfirmedReceipts: number;
  confirmedCount: number;
  lastConfirmedReceiptDate: string | null;
  lastConfirmedReceiptAmount: number | null;
  hasCorrections: boolean;
};

const toRow = (row: typeof projectReceipts.$inferSelect): ProjectReceiptRow => ({
  id: row.id,
  projectId: row.projectId,
  date: row.receiptDate,
  amount: row.amount,
  type: row.type,
  status: row.status,
  comment: row.comment,
  source: row.source,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export class ProjectReceiptsService {
  static async listByProject(teamId: number, projectId: string): Promise<Result<ProjectReceiptRow[]>> {
    try {
      const rows = await db.query.projectReceipts.findMany({
        where: and(
          eq(projectReceipts.projectId, projectId),
          withActiveTenant(projectReceipts, teamId),
        ),
        orderBy: [desc(projectReceipts.receiptDate), desc(projectReceipts.createdAt)],
      });

      return success(rows.map(toRow));
    } catch (serviceError) {
      console.error('ProjectReceiptsService.listByProject error', serviceError);
      return error('Не удалось загрузить поступления проекта');
    }
  }

  static async create(teamId: number, rawPayload: unknown): Promise<Result<ProjectReceiptRow>> {
    const parsed = createProjectReceiptSchema.safeParse(rawPayload);
    if (!parsed.success) return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');

    try {
      const created = await db.transaction(async (tx) => {
        const project = await tx.query.projects.findFirst({
          where: and(eq(projects.id, parsed.data.projectId), withActiveTenant(projects, teamId)),
          columns: { id: true },
        });

        if (!project) throw new Error('PROJECT_NOT_FOUND');

        const [row] = await tx.insert(projectReceipts).values({
          tenantId: teamId,
          projectId: parsed.data.projectId,
          receiptDate: parsed.data.date,
          amount: parsed.data.amount,
          type: parsed.data.type,
          status: parsed.data.status,
          comment: parsed.data.comment,
          source: parsed.data.source ?? null,
        }).returning();

        return row;
      });

      invalidateHomeDashboardCache(teamId);
      return success(toRow(created));
    } catch (serviceError) {
      if (serviceError instanceof Error && serviceError.message === 'PROJECT_NOT_FOUND') {
        return error('Проект не найден', 'NOT_FOUND');
      }

      console.error('ProjectReceiptsService.create error', serviceError);
      return error('Не удалось создать поступление');
    }
  }

  static async update(teamId: number, receiptId: string, rawPatch: unknown): Promise<Result<ProjectReceiptRow>> {
    const parsed = updateProjectReceiptSchema.safeParse(rawPatch);
    if (!parsed.success) return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');

    try {
      const updated = await db.transaction(async (tx) => {
        const existing = await tx.query.projectReceipts.findFirst({
          where: and(eq(projectReceipts.id, receiptId), withActiveTenant(projectReceipts, teamId)),
        });

        if (!existing) throw new Error('NOT_FOUND');

        const [row] = await tx.update(projectReceipts)
          .set({
            receiptDate: parsed.data.date,
            amount: parsed.data.amount,
            type: parsed.data.type,
            status: parsed.data.status,
            comment: parsed.data.comment,
            source: parsed.data.source,
            updatedAt: new Date(),
          })
          .where(and(eq(projectReceipts.id, receiptId), withActiveTenant(projectReceipts, teamId)))
          .returning();

        return row;
      });

      invalidateHomeDashboardCache(teamId);
      return success(toRow(updated));
    } catch (serviceError) {
      if (serviceError instanceof Error && serviceError.message === 'NOT_FOUND') {
        return error('Поступление не найдено', 'NOT_FOUND');
      }

      console.error('ProjectReceiptsService.update error', serviceError);
      return error('Не удалось обновить поступление');
    }
  }

  static async cancel(teamId: number, receiptId: string): Promise<Result<ProjectReceiptRow>> {
    return this.update(teamId, receiptId, { status: 'cancelled' });
  }

  static async getAggregatesByProject(teamId: number, projectId: string): Promise<Result<ProjectReceiptAggregates>> {
    try {
      const rows = await db
        .select({
          totalConfirmedReceipts: sql<number>`COALESCE(SUM(CASE WHEN ${projectReceipts.status} = 'confirmed' THEN ${projectReceipts.amount} ELSE 0 END), 0)`,
          confirmedCount: sql<number>`COALESCE(SUM(CASE WHEN ${projectReceipts.status} = 'confirmed' THEN 1 ELSE 0 END), 0)`,
          hasCorrectionsRaw: sql<number>`COALESCE(SUM(CASE WHEN ${projectReceipts.status} = 'confirmed' AND ${projectReceipts.type} IN ('adjustment', 'refund') THEN 1 ELSE 0 END), 0)`,
        })
        .from(projectReceipts)
        .where(and(eq(projectReceipts.projectId, projectId), withActiveTenant(projectReceipts, teamId)));

      const lastConfirmedRow = await db.query.projectReceipts.findFirst({
        where: and(
          eq(projectReceipts.projectId, projectId),
          eq(projectReceipts.status, 'confirmed'),
          withActiveTenant(projectReceipts, teamId),
        ),
        columns: { receiptDate: true, amount: true },
        orderBy: [desc(projectReceipts.receiptDate), desc(projectReceipts.createdAt)],
      });

      return success({
        totalConfirmedReceipts: Number(rows[0]?.totalConfirmedReceipts ?? 0),
        confirmedCount: Number(rows[0]?.confirmedCount ?? 0),
        lastConfirmedReceiptDate: lastConfirmedRow?.receiptDate ?? null,
        lastConfirmedReceiptAmount: lastConfirmedRow?.amount ?? null,
        hasCorrections: Number(rows[0]?.hasCorrectionsRaw ?? 0) > 0,
      });
    } catch (serviceError) {
      console.error('ProjectReceiptsService.getAggregatesByProject error', serviceError);
      return error('Не удалось рассчитать агрегаты поступлений');
    }
  }

  static async listConfirmedByProjectAndRange(teamId: number, projectId: string, rawRange: unknown): Promise<Result<ProjectReceiptRow[]>> {
    const parsed = receiptRangeSchema.safeParse(rawRange);
    if (!parsed.success) return error(`Ошибка валидации: ${parsed.error.message}`, 'VALIDATION_ERROR');

    try {
      const rows = await db.query.projectReceipts.findMany({
        where: and(
          eq(projectReceipts.projectId, projectId),
          eq(projectReceipts.status, 'confirmed'),
          withActiveTenant(projectReceipts, teamId),
          gte(projectReceipts.receiptDate, parsed.data.from),
          lte(projectReceipts.receiptDate, parsed.data.to),
        ),
        orderBy: [asc(projectReceipts.receiptDate), asc(projectReceipts.createdAt)],
      });

      return success(rows.map(toRow));
    } catch (serviceError) {
      console.error('ProjectReceiptsService.listConfirmedByProjectAndRange error', serviceError);
      return error('Не удалось получить поступления за период');
    }
  }

  static async getConfirmedTotalsByPeriods(teamId: number, projectId: string, now: Date = new Date()) {
    const toIsoDate = (value: Date) => {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const end = toIsoDate(now);
    const oneMonth = new Date(now);
    oneMonth.setMonth(oneMonth.getMonth() - 1);
    const threeMonths = new Date(now);
    threeMonths.setMonth(threeMonths.getMonth() - 3);
    const twelveMonths = new Date(now);
    twelveMonths.setMonth(twelveMonths.getMonth() - 12);

    const range1From = toIsoDate(oneMonth);
    const range3From = toIsoDate(threeMonths);
    const range12From = toIsoDate(twelveMonths);

    const rows = await db
      .select({
        month1Raw: sql<number>`COALESCE(SUM(CASE
          WHEN ${projectReceipts.status} = 'confirmed'
           AND ${projectReceipts.receiptDate} >= ${range1From}
           AND ${projectReceipts.receiptDate} <= ${end}
          THEN ${projectReceipts.amount}
          ELSE 0
        END), 0)`,
        month3Raw: sql<number>`COALESCE(SUM(CASE
          WHEN ${projectReceipts.status} = 'confirmed'
           AND ${projectReceipts.receiptDate} >= ${range3From}
           AND ${projectReceipts.receiptDate} <= ${end}
          THEN ${projectReceipts.amount}
          ELSE 0
        END), 0)`,
        month12Raw: sql<number>`COALESCE(SUM(CASE
          WHEN ${projectReceipts.status} = 'confirmed'
           AND ${projectReceipts.receiptDate} >= ${range12From}
           AND ${projectReceipts.receiptDate} <= ${end}
          THEN ${projectReceipts.amount}
          ELSE 0
        END), 0)`,
        cumulativeRaw: sql<number>`COALESCE(SUM(CASE
          WHEN ${projectReceipts.status} = 'confirmed'
          THEN ${projectReceipts.amount}
          ELSE 0
        END), 0)`,
        hasCorrectionsRaw: sql<number>`COALESCE(SUM(CASE
          WHEN ${projectReceipts.status} = 'confirmed'
           AND ${projectReceipts.type} IN ('adjustment', 'refund')
          THEN 1
          ELSE 0
        END), 0)`,
      })
      .from(projectReceipts)
      .where(and(eq(projectReceipts.projectId, projectId), withActiveTenant(projectReceipts, teamId)));

    return {
      month1: Number(rows[0]?.month1Raw ?? 0),
      month3: Number(rows[0]?.month3Raw ?? 0),
      month12: Number(rows[0]?.month12Raw ?? 0),
      cumulative: Number(rows[0]?.cumulativeRaw ?? 0),
      hasCorrections: Number(rows[0]?.hasCorrectionsRaw ?? 0) > 0,
    };
  }
}
