import { db } from '@/lib/data/db/drizzle';
import { materials, NewMaterial } from '@/lib/data/db/schema';
import { and, eq } from 'drizzle-orm';
import { MaterialsService } from '@/lib/domain/materials/materials.service';
import { ExcelService } from '@/lib/services/excel.service';
import { success, error, type Result } from '@/lib/utils/result';
import { materialsHeaderMap, materialsRequiredFields } from '@/lib/constants/import-configs';
import { withActiveTenant } from '@/lib/data/db/queries';

export class MaterialsImportExportService {
  static async importFromFile(teamId: number, file: File): Promise<Result<{ summaryMessage: string; materialsToUpsert: NewMaterial[] }>> {
    if (!file) {
      return error('Ошибка передачи файла');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parseResult = await ExcelService.parseBuffer<Record<string, unknown>>(buffer, {
      headerMap: materialsHeaderMap,
      requiredFields: materialsRequiredFields,
    });

    if (!parseResult.success) {
      return parseResult;
    }

    const { data: parsedRows, summary } = parseResult.data;

    const materialsToUpsert: NewMaterial[] = parsedRows.map((row) => ({
      tenantId: teamId,
      code: String(row.code),
      name: String(row.name),
      nameNorm: String(row.name).toLowerCase(),
      unit: row.unit ? String(row.unit) : undefined,
      price: row.price ? Number(row.price) : undefined,
      vendor: row.vendor ? String(row.vendor) : undefined,
      weight: row.weight ? String(row.weight) : undefined,
      categoryLv1: row.categoryLv1 ? String(row.categoryLv1) : undefined,
      categoryLv2: row.categoryLv2 ? String(row.categoryLv2) : undefined,
      categoryLv3: row.categoryLv3 ? String(row.categoryLv3) : undefined,
      categoryLv4: row.categoryLv4 ? String(row.categoryLv4) : undefined,
      productUrl: row.productUrl ? String(row.productUrl) : undefined,
      imageUrl: row.imageUrl ? String(row.imageUrl) : undefined,
      description: row.description ? String(row.description) : undefined,
      status: 'active',
    }));

    const upsertResult = await MaterialsService.upsertMany(teamId, materialsToUpsert);
    if (!upsertResult.success) {
      return upsertResult;
    }

    const summaryMessage = `Импорт завершен. Успешно: ${summary.success}, Пропущено: ${summary.skipped}`;
    return success({ summaryMessage, materialsToUpsert });
  }

  static async exportForTeam(teamId: number) {
    const dbData = await db
      .select({
        'Код': materials.code,
        'Наименование': materials.name,
        'Ед изм': materials.unit,
        'Цена': materials.price,
        'Поставщик': materials.vendor,
        'Вес (кг)': materials.weight,
        'Категория LV1': materials.categoryLv1,
        'Категория LV2': materials.categoryLv2,
        'Категория LV3': materials.categoryLv3,
        'Категория LV4': materials.categoryLv4,
        'URL товара': materials.productUrl,
        'URL изображения': materials.imageUrl,
        'Описание': materials.description,
      })
      .from(materials)
      .where(and(withActiveTenant(materials, teamId), eq(materials.status, 'active')));

    return success(dbData);
  }
}
