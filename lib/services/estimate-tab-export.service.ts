import ExcelJS from 'exceljs';
import { Result, error, success } from '@/lib/utils/result';
import { EstimateProcurementService } from '@/lib/services/estimate-procurement.service';
import { EstimateExecutionService } from '@/lib/services/estimate-execution.service';

const CURRENCY_FORMAT = '#,##0.00 [$₽-419]';
const NUMBER_FORMAT = '#,##0.00';

const BASE_BORDER: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
};

const HEADER_FILL: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' },
};

const toFilenameSafe = (value: string) => value.replace(/[^a-zA-Z0-9-_]/g, '-');

const formatNow = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}`;
};

const formatExecutionStatus = (status: 'not_started' | 'in_progress' | 'done') => {
    if (status === 'done') return 'Выполнено';
    if (status === 'in_progress') return 'В процессе';
    return 'Подготовка';
};

const styleWorksheet = (worksheet: ExcelJS.Worksheet, rowCount: number, moneyColumns: number[], numberColumns: number[]) => {
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 11 };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    for (let col = 1; col <= worksheet.columnCount; col += 1) {
        const headerCell = headerRow.getCell(col);
        headerCell.fill = HEADER_FILL;
        headerCell.border = BASE_BORDER;
    }

    for (let rowIndex = 2; rowIndex <= rowCount; rowIndex += 1) {
        const row = worksheet.getRow(rowIndex);
        for (let col = 1; col <= worksheet.columnCount; col += 1) {
            const cell = row.getCell(col);
            cell.border = BASE_BORDER;
            cell.alignment = {
                vertical: 'middle',
                horizontal: col === 1 || col === 2 ? 'left' : 'right',
                wrapText: col === 1 || col === 2,
            };
        }

        for (const moneyCol of moneyColumns) {
            row.getCell(moneyCol).numFmt = CURRENCY_FORMAT;
        }

        for (const numCol of numberColumns) {
            row.getCell(numCol).numFmt = NUMBER_FORMAT;
        }
    }

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
};

export class EstimateTabExportService {
    static async exportProcurementXlsx(teamId: number, estimateId: string): Promise<Result<{ buffer: Buffer; filename: string }>> {
        const rowsResult = await EstimateProcurementService.list(teamId, estimateId);
        if (!rowsResult.success) {
            return error(rowsResult.error.message, rowsResult.error.code);
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Закупки');

        worksheet.columns = [
            { header: 'Материал', key: 'materialName', width: 54 },
            { header: 'Ед.', key: 'unit', width: 8 },
            { header: 'Кол-во', key: 'plannedQty', width: 12 },
            { header: 'Цена', key: 'plannedPrice', width: 14 },
            { header: 'Сумма', key: 'plannedAmount', width: 16 },
            { header: 'ф. Кол-во', key: 'actualQty', width: 12 },
            { header: 'Ср. цена', key: 'actualAvgPrice', width: 14 },
            { header: 'ф. Сумма', key: 'actualAmount', width: 16 },
            { header: 'Δ Кол-во', key: 'qtyDelta', width: 12 },
            { header: 'Δ Сумма', key: 'amountDelta', width: 16 },
        ];

        for (const row of rowsResult.data) {
            worksheet.addRow({
                materialName: row.materialName,
                unit: row.unit,
                plannedQty: row.plannedQty,
                plannedPrice: row.plannedPrice,
                plannedAmount: row.plannedAmount,
                actualQty: row.actualQty,
                actualAvgPrice: row.actualAvgPrice,
                actualAmount: row.actualAmount,
                qtyDelta: row.qtyDelta,
                amountDelta: row.amountDelta,
            });
        }

        styleWorksheet(worksheet, worksheet.rowCount, [4, 5, 7, 8, 10], [3, 6, 9]);

        const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
        return success({
            buffer,
            filename: `estimate_${toFilenameSafe(estimateId)}_procurement_${formatNow(new Date())}.xlsx`,
        });
    }

    static async exportExecutionXlsx(teamId: number, estimateId: string): Promise<Result<{ buffer: Buffer; filename: string }>> {
        const rowsResult = await EstimateExecutionService.list(teamId, estimateId);
        if (!rowsResult.success) {
            return error(rowsResult.error.message, rowsResult.error.code);
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Выполнение');

        worksheet.columns = [
            { header: 'Код', key: 'code', width: 10 },
            { header: 'Работа', key: 'name', width: 56 },
            { header: 'Ед.', key: 'unit', width: 8 },
            { header: 'Кол-во', key: 'plannedQty', width: 12 },
            { header: 'Цена', key: 'plannedPrice', width: 14 },
            { header: 'План сумма', key: 'plannedSum', width: 16 },
            { header: 'Факт кол-во', key: 'actualQty', width: 12 },
            { header: 'Факт цена', key: 'actualPrice', width: 14 },
            { header: 'Факт сумма', key: 'actualSum', width: 16 },
            { header: 'Статус', key: 'status', width: 16 },
        ];

        for (const row of rowsResult.data) {
            worksheet.addRow({
                code: row.code,
                name: row.name,
                unit: row.unit,
                plannedQty: row.plannedQty,
                plannedPrice: row.plannedPrice,
                plannedSum: row.plannedSum,
                actualQty: row.actualQty,
                actualPrice: row.actualPrice,
                actualSum: row.actualSum,
                status: formatExecutionStatus(row.status),
            });
        }

        styleWorksheet(worksheet, worksheet.rowCount, [5, 6, 8, 9], [4, 7]);

        const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
        return success({
            buffer,
            filename: `estimate_${toFilenameSafe(estimateId)}_execution_${formatNow(new Date())}.xlsx`,
        });
    }
}
