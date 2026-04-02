import { db } from '@/lib/data/db/drizzle';
import { works, NewWork } from '@/lib/data/db/schema';
import { and, eq } from 'drizzle-orm';
import { WorksService } from '@/lib/domain/works/works.service';
import { ExcelService } from '@/lib/services/excel.service';
import { error, success, type Result } from '@/lib/utils/result';
import { worksHeaderMap, worksRequiredFields } from '@/lib/constants/import-configs';
import { withActiveTenant } from '@/lib/data/db/queries';

export class WorksImportExportService {
  static async importFromFile(teamId: number, file: File): Promise<Result<{ summaryMessage: string }>> {
    if (!file) {
      return error('Файл не найден');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parseResult = await ExcelService.parseBuffer<Record<string, unknown>>(buffer, {
      headerMap: worksHeaderMap,
      requiredFields: worksRequiredFields,
    });

    if (!parseResult.success) {
      return parseResult;
    }

    const { data: parsedRows, summary } = parseResult.data;

    const newWorks: NewWork[] = parsedRows.map((row, index) => ({
      tenantId: teamId,
      code: String(row.code),
      name: String(row.name),
      sortOrder: (index + 1) * 100,
      unit: row.unit ? String(row.unit) : undefined,
      price: row.price ? Number(row.price) : undefined,
      phase: row.phase ? String(row.phase) : undefined,
      category: row.category ? String(row.category) : undefined,
      subcategory: row.subcategory ? String(row.subcategory) : undefined,
      shortDescription: row.shortDescription ? String(row.shortDescription) : undefined,
      description: row.description ? String(row.description) : undefined,
      status: 'active',
    }));

    const upsertResult = await WorksService.upsertMany(teamId, newWorks);
    if (!upsertResult.success) {
      return upsertResult;
    }

    return success({
      summaryMessage: `Импорт завершен. Успешно: ${summary.success}, Пропущено: ${summary.skipped}`,
    });
  }

  static async exportForTeam(teamId: number) {
    const worksData = await db
      .select({
        code: works.code,
        name: works.name,
        unit: works.unit,
        price: works.price,
        phase: works.phase,
        category: works.category,
        subcategory: works.subcategory,
        shortDescription: works.shortDescription,
        description: works.description,
      })
      .from(works)
      .where(and(withActiveTenant(works, teamId), eq(works.status, 'active')))
      .orderBy(works.sortOrder, works.id);

    return success(worksData);
  }
}
