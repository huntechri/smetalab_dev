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
  kind: z.enum(["section", "work", "material"]),
  name: z.string().trim().min(1),
  unit: z.string().trim(),
  qty: z.number().nonnegative(),
  price: z.number().nonnegative(),
});

export type ImportedEstimateRow = z.infer<typeof importedEstimateRowSchema>;

type ParsedHeader = {
  rowIndex: number;
  codeCol: number;
  kindCol?: number;
  nameCol: number;
  unitCol: number;
  qtyCol: number;
  priceCol: number;
};

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

function parseHeader(worksheet: ExcelJS.Worksheet): ParsedHeader {
  const tryParse = (headerRowIndex: number): ParsedHeader | null => {
    const headerRow = worksheet.getRow(headerRowIndex);
    const values = Array.from({ length: 12 }, (_, index) =>
      normalizeCellValue(headerRow.getCell(index + 1).value).toLocaleLowerCase(),
    );

    const indexOf = (label: string) => {
      const idx = values.findIndex((value) => value === label);
      return idx >= 0 ? idx + 1 : undefined;
    };

    const codeCol = indexOf("код");
    const nameCol = indexOf("наименование");
    const unitCol = indexOf("ед.");
    const qtyCol = indexOf("кол-во");
    const priceCol = indexOf("цена");
    const kindCol = indexOf("тип");

    if (!codeCol || !nameCol || !unitCol || !qtyCol || !priceCol) {
      return null;
    }

    return {
      rowIndex: headerRowIndex,
      codeCol,
      kindCol,
      nameCol,
      unitCol,
      qtyCol,
      priceCol,
    };
  };

  for (let rowIndex = 1; rowIndex <= Math.min(20, worksheet.rowCount); rowIndex += 1) {
    const parsed = tryParse(rowIndex);
    if (parsed) {
      return parsed;
    }
  }

  return {
    rowIndex: 4,
    codeCol: 1,
    kindCol: 2,
    nameCol: 3,
    unitCol: 5,
    qtyCol: 6,
    priceCol: 7,
  };
}

function parseKind(
  code: string,
  kindCellValue: string,
): "section" | "work" | "material" {
  const normalizedKind = kindCellValue.toLocaleLowerCase();

  if (normalizedKind === "раздел") {
    return "section";
  }

  if (normalizedKind === "работа") {
    return "work";
  }

  if (normalizedKind === "материал") {
    return "material";
  }

  if (code.includes(".")) {
    return "material";
  }

  return "work";
}

function parseRowsFromWorksheet(
  worksheet: ExcelJS.Worksheet,
): Result<ImportedEstimateRow[]> {
  const rows: ImportedEstimateRow[] = [];
  const header = parseHeader(worksheet);

  for (let rowIndex = header.rowIndex + 1; rowIndex <= worksheet.rowCount; rowIndex += 1) {
    const row = worksheet.getRow(rowIndex);
    const code = normalizeCellValue(row.getCell(header.codeCol).value);
    const name = normalizeCellValue(row.getCell(header.nameCol).value).trimStart();

    if (!code || !name) {
      continue;
    }

    if (code.toLocaleLowerCase().startsWith("итого")) {
      continue;
    }

    const rawKind = header.kindCol
      ? normalizeCellValue(row.getCell(header.kindCol).value)
      : "";
    const kind = parseKind(code, rawKind);

    const unit = kind === "section" ? "" : normalizeCellValue(row.getCell(header.unitCol).value) || "шт";
    const qty = kind === "section" ? 0 : parseNumberCell(row.getCell(header.qtyCol).value);
    const price = kind === "section" ? 0 : parseNumberCell(row.getCell(header.priceCol).value);

    const parsed = importedEstimateRowSchema.safeParse({
      code,
      kind,
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

        const workRowsToInsert: (typeof estimateRows.$inferInsert)[] = [];
        const sectionRowsToInsert: (typeof estimateRows.$inferInsert)[] = [];
        const materialRowsToInsert: {
          workIdx: number;
          data: typeof estimateRows.$inferInsert;
        }[] = [];
        const parentByCode = new Map<string, number>();

        for (let index = 0; index < importedRows.length; index += 1) {
          const item = importedRows[index];
          const sum = item.qty * item.price;
          const rowData: typeof estimateRows.$inferInsert = {
            tenantId: teamId,
            estimateId,
            kind: item.kind,
            code: item.code,
            name: item.name,
            unit: item.unit,
            qty: item.qty,
            price: item.price,
            sum,
            expense: 0,
            order: (index + 1) * 10,
          };

          if (item.kind === "section") {
            sectionRowsToInsert.push(rowData);
            continue;
          }

          if (item.kind === "work") {
            workRowsToInsert.push(rowData);
            parentByCode.set(item.code, workRowsToInsert.length - 1);
            continue;
          }

          const parentCode = item.code.includes(".")
            ? item.code.split(".").slice(0, -1).join(".")
            : null;
          const workIdx = parentCode ? parentByCode.get(parentCode) : undefined;
          if (typeof workIdx === "undefined") {
            throw new Error(`INVALID_PARENT_${item.code}`);
          }

          materialRowsToInsert.push({ workIdx, data: rowData });
        }

        const simpleRowsToInsert = [...sectionRowsToInsert, ...workRowsToInsert].sort(
          (left, right) => (left.order ?? 0) - (right.order ?? 0),
        );

        const insertedRows =
          simpleRowsToInsert.length > 0
            ? await tx
                .insert(estimateRows)
                .values(simpleRowsToInsert)
                .returning({ id: estimateRows.id, code: estimateRows.code, kind: estimateRows.kind })
            : [];

        const insertedWorkByCode = new Map(
          insertedRows.filter((row) => row.kind === "work").map((row) => [row.code, row.id]),
        );

        if (materialRowsToInsert.length > 0) {
          const materialValues = materialRowsToInsert.map((material) => {
            const parentCode = material.data.code?.split(".").slice(0, -1).join(".") ?? "";
            const parentWorkId = insertedWorkByCode.get(parentCode);

            if (!parentWorkId) {
              throw new Error(`INVALID_PARENT_${material.data.code}`);
            }

            return {
              ...material.data,
              parentWorkId,
            };
          });

          await tx.insert(estimateRows).values(materialValues);
        }

        const [{ total }] = await tx
          .select({
            total: sql<number>`COALESCE(SUM(CASE WHEN ${estimateRows.kind} = 'section' THEN 0 ELSE ${estimateRows.sum} END), 0)`,
          })
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
