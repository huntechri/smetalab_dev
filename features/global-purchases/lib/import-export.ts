import { z } from 'zod';
import ExcelJS from 'exceljs';

export type ImportablePurchaseRow = {
  purchaseDate: string;
  projectName: string;
  materialName: string;
  unit: string;
  qty: number;
  price: number;
  note: string;
  supplierName: string;
};

export type ExportablePurchaseRow = ImportablePurchaseRow & {
  supplierColor?: string | null;
};

const csvRowSchema = z.object({
  purchaseDate: z.string().date(),
  projectName: z.string().trim().max(160),
  materialName: z.string().trim().min(1).max(240),
  unit: z.string().trim().min(1).max(20),
  qty: z.number().finite().min(0),
  price: z.number().finite().min(0),
  note: z.string().trim().max(500),
  supplierName: z.string().trim().max(160),
});

const CSV_HEADERS = ['Дата', 'Объект', 'Материал', 'Ед.', 'Кол-во', 'Цена', 'Сумма', 'Поставщик', 'Примечание'] as const;

const normalizeHeader = (value: string) => value.trim().toLowerCase();

const parseDelimitedLine = (line: string, delimiter: string): string[] => {
  const cells: string[] = [];
  let buffer = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      const next = line[index + 1];
      if (inQuotes && next === '"') {
        buffer += '"';
        index += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && char === delimiter) {
      cells.push(buffer.trim());
      buffer = '';
      continue;
    }

    buffer += char;
  }

  cells.push(buffer.trim());
  return cells;
};

const toCsvCell = (value: string | number): string => {
  const text = String(value);
  if (!text.includes(';') && !text.includes('"') && !text.includes('\n')) {
    return text;
  }

  return `"${text.replaceAll('"', '""')}"`;
};

export const exportGlobalPurchasesCsv = (rows: ImportablePurchaseRow[]): string => {
  const lines = [CSV_HEADERS.join(';')];

  for (const row of rows) {
    const amount = Math.round((row.qty * row.price + Number.EPSILON) * 100) / 100;
    lines.push([
      toCsvCell(row.purchaseDate),
      toCsvCell(row.projectName),
      toCsvCell(row.materialName),
      toCsvCell(row.unit),
      toCsvCell(row.qty),
      toCsvCell(row.price),
      toCsvCell(amount),
      toCsvCell(row.supplierName),
      toCsvCell(row.note),
    ].join(';'));
  }

  return `\uFEFF${lines.join('\n')}`;
};

const XLSX_HEADERS = ['Дата', 'Объект', 'Наименование материала', 'Ед.', 'Кол-во', 'Цена', 'Сумма', 'Поставщик', 'Примечание'] as const;
const thinBorder = { style: 'thin' as const, color: { argb: 'FFD9D9D9' } };

const toArgbColor = (color: string | null | undefined): string | null => {
  if (!color) return null;
  const normalized = color.trim().replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    return null;
  }

  return `FF${normalized.toUpperCase()}`;
};

export const exportGlobalPurchasesXlsx = async (rows: ExportablePurchaseRow[]): Promise<ArrayBuffer> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Глобальные закупки');

  sheet.columns = [
    { width: 14 },
    { width: 22 },
    { width: 64 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 14 },
    { width: 24 },
    { width: 30 },
  ];

  const headerRow = sheet.addRow(XLSX_HEADERS);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
    cell.border = { top: thinBorder, left: thinBorder, bottom: thinBorder, right: thinBorder };
  });

  let previousProjectName: string | null = null;
  for (const row of rows) {
    if (previousProjectName !== null && previousProjectName !== row.projectName) {
      sheet.addRow([]);
    }
    previousProjectName = row.projectName;

    const amount = Math.round((row.qty * row.price + Number.EPSILON) * 100) / 100;
    const dataRow = sheet.addRow([
      row.purchaseDate,
      row.projectName,
      row.materialName,
      row.unit,
      row.qty,
      row.price,
      amount,
      row.supplierName,
      row.note,
    ]);

    dataRow.eachCell((cell, colNumber) => {
      cell.border = { top: thinBorder, left: thinBorder, bottom: thinBorder, right: thinBorder };
      if (colNumber === 3) {
        cell.alignment = { wrapText: true, vertical: 'top' };
      } else {
        cell.alignment = { vertical: 'middle' };
      }
    });

    const supplierArgb = toArgbColor(row.supplierColor);
    if (supplierArgb) {
      const supplierCell = dataRow.getCell(8);
      supplierCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: supplierArgb } };
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
};

export const parseGlobalPurchasesCsv = (input: string): ImportablePurchaseRow[] => {
  const normalized = input.replace(/^\uFEFF/, '').replaceAll('\r\n', '\n').trim();
  if (!normalized) {
    return [];
  }

  const lines = normalized.split('\n').filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('Файл не содержит строк для импорта.');
  }

  const headers = parseDelimitedLine(lines[0], ';').map(normalizeHeader);
  const headerIndex = {
    purchaseDate: headers.indexOf(normalizeHeader('Дата')),
    projectName: headers.indexOf(normalizeHeader('Объект')),
    materialName: headers.indexOf(normalizeHeader('Материал')),
    unit: headers.indexOf(normalizeHeader('Ед.')),
    qty: headers.indexOf(normalizeHeader('Кол-во')),
    price: headers.indexOf(normalizeHeader('Цена')),
    supplierName: headers.indexOf(normalizeHeader('Поставщик')),
    note: headers.indexOf(normalizeHeader('Примечание')),
  };

  if (Object.values(headerIndex).some((index) => index < 0)) {
    throw new Error('Некорректный формат CSV. Проверьте заголовки файла.');
  }

  const parsedRows: ImportablePurchaseRow[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const cells = parseDelimitedLine(lines[lineIndex], ';');

    const qty = Number((cells[headerIndex.qty] ?? '').replace(',', '.'));
    const price = Number((cells[headerIndex.price] ?? '').replace(',', '.'));

    const row = csvRowSchema.parse({
      purchaseDate: cells[headerIndex.purchaseDate] ?? '',
      projectName: cells[headerIndex.projectName] ?? '',
      materialName: cells[headerIndex.materialName] ?? '',
      unit: cells[headerIndex.unit] ?? '',
      qty,
      price,
      note: cells[headerIndex.note] ?? '',
      supplierName: cells[headerIndex.supplierName] ?? '',
    });

    parsedRows.push(row);
  }

  return parsedRows;
};
