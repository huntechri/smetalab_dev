import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { EstimateImportService } from "@/lib/services/estimate-import.service";

describe("EstimateImportService", () => {
  it("parses exported estimate xlsx rows", async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Смета");
    sheet.getRow(4).values = [
      "Код",
      "Тип",
      "Наименование",
      "Превью",
      "Ед.",
      "Кол-во",
      "Цена",
      "Сумма",
    ];
    sheet.getRow(5).values = ["1", "Раздел", "Черновые работы", "", "", "", "", ""];
    sheet.getRow(6).values = ["1.1", "Работа", "Штукатурка", "", "м2", 12, 500, 6000];
    sheet.getRow(7).values = [
      "1.1.1",
      "Материал",
      "Штукатурная смесь",
      "",
      "меш",
      8,
      300,
      2400,
    ];

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const result = await EstimateImportService.parseXlsx(buffer);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([
        { code: "1", kind: "section", name: "Черновые работы", unit: "", qty: 0, price: 0 },
        { code: "1.1", kind: "work", name: "Штукатурка", unit: "м2", qty: 12, price: 500 },
        {
          code: "1.1.1",
          kind: "material",
          name: "Штукатурная смесь",
          unit: "меш",
          qty: 8,
          price: 300,
        },
      ]);
    }
  });



  it("parses legacy xlsx without type column", async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Смета");
    sheet.getRow(4).values = [
      "Код",
      "Наименование",
      "Превью",
      "Ед.",
      "Кол-во",
      "Цена",
      "Сумма",
    ];
    sheet.getRow(5).values = ["2", "Монтаж", "", "шт", 3, 100, 300];
    sheet.getRow(6).values = ["2.1", "Крепёж", "", "шт", 6, 10, 60];

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const result = await EstimateImportService.parseXlsx(buffer);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].kind).toBe("work");
      expect(result.data[1].kind).toBe("material");
    }
  });
  it("returns validation error for empty file", async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet("Смета");

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const result = await EstimateImportService.parseXlsx(buffer);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });
});
