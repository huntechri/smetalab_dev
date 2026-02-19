import { Readable } from "node:stream";
import ExcelJS from "exceljs";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/data/db/drizzle";
import { withActiveTenant } from "@/lib/data/db/queries";
import { estimateRows, estimates } from "@/lib/data/db/schema";
import { Result, error, success } from "@/lib/utils/result";

const importedEstimateRowSchema = z.object({
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  unit: z.string().trim().min(1),
  qty: z.number().nonnegative(),
  price: z.number().nonnegative(),
});

export type ImportedEstimateRow = z.infer<typeof importedEstimateRowSchema>;

function normalizeCellValue(value: ExcelJS.CellValue | undefined): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value).trim();
  }

  if (
    value &&
    typeof value === "object" &&
    "result" in value &&
    typeof value.result !== "undefined"
  ) {
    return normalizeCellValue(value.result as ExcelJS.CellValue);
  }

  return "";
}

function parseNumberCell(value: ExcelJS.CellValue | undefined): number {
  const normalized = normalizeCellValue(value).replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function parseRowsFromWorksheet(
  worksheet: ExcelJS.Worksheet,
): Result<ImportedEstimateRow[]> {
  const rows: ImportedEstimateRow[] = [];

  for (let rowIndex = 5; rowIndex <= worksheet.rowCount; rowIndex += 1) {
    const row = worksheet.getRow(rowIndex);
    const code = normalizeCellValue(row.getCell(1).value);
    const name = normalizeCellValue(row.getCell(2).value).trimStart();

    if (!code || !name) {
      continue;
    }

    if (code.toLocaleLowerCase().startsWith("итого")) {
      continue;
    }

    const unit = normalizeCellValue(row.getCell(4).value) || "шт";
    const qty = parseNumberCell(row.getCell(5).value);
    const price = parseNumberCell(row.getCell(6).value);

    const parsed = importedEstimateRowSchema.safeParse({
      code,
      name,
      unit,
      qty,
      price,
    });
    if (!parsed.success) {
      return error(
        `Некорректные данные в строке ${rowIndex}`,
        "VALIDATION_ERROR",
      );
    }

    rows.push(parsed.data);
  }

  if (rows.length === 0) {
    return error(
      "Файл не содержит строк сметы для импорта",
      "VALIDATION_ERROR",
    );
  }

  return success(rows);
}

export class EstimateImportService {
  static async parseXlsx(
    fileBuffer: Uint8Array,
  ): Promise<Result<ImportedEstimateRow[]>> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.read(Readable.from(fileBuffer));
      const worksheet =
        workbook.getWorksheet("Смета") ?? workbook.worksheets[0];

      if (!worksheet) {
        return error("Не найден лист сметы в файле", "VALIDATION_ERROR");
      }

      return parseRowsFromWorksheet(worksheet);
    } catch (serviceError) {
      console.error("EstimateImportService.parseXlsx error:", serviceError);
      return error("Не удалось прочитать файл сметы", "VALIDATION_ERROR");
    }
  }

  static async replaceRowsFromImport(
    teamId: number,
    estimateId: string,
    importedRows: ImportedEstimateRow[],
  ): Promise<Result<{ imported: number }>> {
    try {
      const estimate = await db.query.estimates.findFirst({
        where: and(
          eq(estimates.id, estimateId),
          withActiveTenant(estimates, teamId),
        ),
      });

      if (!estimate) {
        return error("Смета не найдена", "NOT_FOUND");
      }

      await db.transaction(async (tx) => {
        await tx
          .update(estimateRows)
          .set({ deletedAt: new Date(), updatedAt: new Date() })
          .where(
            and(
              eq(estimateRows.estimateId, estimateId),
              withActiveTenant(estimateRows, teamId),
              isNull(estimateRows.deletedAt),
            ),
          );

        const parentByCode = new Map<string, string>();

        for (let index = 0; index < importedRows.length; index += 1) {
          const item = importedRows[index];
          const parentCode = item.code.includes(".")
            ? item.code.split(".").slice(0, -1).join(".")
            : null;
          const kind: "work" | "material" = parentCode ? "material" : "work";
          const parentWorkId = parentCode
            ? (parentByCode.get(parentCode) ?? null)
            : null;

          if (kind === "material" && !parentWorkId) {
            throw new Error(`INVALID_PARENT_${item.code}`);
          }

          const sum = item.qty * item.price;
          const [created] = await tx
            .insert(estimateRows)
            .values({
              tenantId: teamId,
              estimateId,
              kind,
              parentWorkId,
              code: item.code,
              name: item.name,
              unit: item.unit,
              qty: item.qty,
              price: item.price,
              sum,
              expense: 0,
              order: (index + 1) * 10,
            })
            .returning({ id: estimateRows.id });

          if (kind === "work") {
            parentByCode.set(item.code, created.id);
          }
        }

        const [{ total }] = await tx
          .select({ total: sql<number>`COALESCE(SUM(${estimateRows.sum}), 0)` })
          .from(estimateRows)
          .where(
            and(
              eq(estimateRows.estimateId, estimateId),
              withActiveTenant(estimateRows, teamId),
              isNull(estimateRows.deletedAt),
            ),
          );

        await tx
          .update(estimates)
          .set({ total: Math.round(total), updatedAt: new Date() })
          .where(eq(estimates.id, estimateId));
      });

      return success({ imported: importedRows.length });
    } catch (serviceError) {
      if (
        serviceError instanceof Error &&
        serviceError.message.startsWith("INVALID_PARENT_")
      ) {
        return error(
          "Нарушена структура сметы: материал должен идти после родительской работы",
          "VALIDATION_ERROR",
        );
      }

      console.error(
        "EstimateImportService.replaceRowsFromImport error:",
        serviceError,
      );
      return error("Не удалось импортировать смету");
    }
  }
}

export const __estimateImportServiceInternal = {
  parseRowsFromWorksheet,
};
