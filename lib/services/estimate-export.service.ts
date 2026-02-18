import ExcelJS from 'exceljs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/data/db/drizzle';
import { withActiveTenant } from '@/lib/data/db/queries';
import { estimateRows, estimates, projects } from '@/lib/data/db/schema';
import { Result, error, success } from '@/lib/utils/result';

const exportFormatSchema = z.enum(['xlsx', 'pdf']);

export type EstimateExportFormat = z.infer<typeof exportFormatSchema>;

const estimateExportRowSchema = z.object({
    id: z.string(),
    kind: z.enum(['work', 'material']),
    parentWorkId: z.string().nullable(),
    code: z.string(),
    name: z.string(),
    imageUrl: z.string().nullable(),
    unit: z.string(),
    qty: z.number(),
    price: z.number(),
    sum: z.number(),
    expense: z.number(),
    order: z.number(),
});

export type EstimateExportRow = z.infer<typeof estimateExportRowSchema>;

export type EstimateExportPayload = {
    estimateId: string;
    estimateName: string;
    projectName: string;
    rows: EstimateExportRow[];
    totals: {
        works: number;
        materials: number;
        grand: number;
    };
};

type DownloadedImage = {
    buffer: Buffer;
    extension: 'jpeg' | 'png';
};

const CURRENCY_FORMAT = '#,##0.00 [$₽-419]';

function safeFileName(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9а-яё-]/gi, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'estimate';
}

function computeTotals(rows: EstimateExportRow[]) {
    const totals = rows.reduce((acc, row) => {
        if (row.kind === 'work') {
            acc.works += row.sum;
        } else {
            acc.materials += row.sum;
        }
        return acc;
    }, { works: 0, materials: 0 });

    return {
        works: totals.works,
        materials: totals.materials,
        grand: totals.works + totals.materials,
    };
}

async function downloadImage(imageUrl: string): Promise<DownloadedImage | null> {
    try {
        const response = await fetch(imageUrl, {
            signal: AbortSignal.timeout(7000),
            headers: {
                'User-Agent': 'Smetalab-EstimateExport/1.0',
                Accept: 'image/png,image/jpeg,image/*;q=0.8,*/*;q=0.2',
            },
        });

        if (!response.ok) {
            return null;
        }

        const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
        const isPng = contentType.includes('png');
        const isJpeg = contentType.includes('jpeg') || contentType.includes('jpg');

        if (!isPng && !isJpeg) {
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.byteLength === 0 || buffer.byteLength > 4 * 1024 * 1024) {
            return null;
        }

        return {
            buffer,
            extension: isPng ? 'png' : 'jpeg',
        };
    } catch {
        return null;
    }
}

export class EstimateExportService {
    static validateFormat(format: string): Result<EstimateExportFormat> {
        const parsed = exportFormatSchema.safeParse(format);
        if (!parsed.success) {
            return error('Неподдерживаемый формат экспорта', 'VALIDATION_ERROR');
        }

        return success(parsed.data);
    }

    static async buildPayload(teamId: number, estimateId: string): Promise<Result<EstimateExportPayload>> {
        try {
            const estimateRecord = await db
                .select({
                    id: estimates.id,
                    name: estimates.name,
                    projectName: projects.name,
                })
                .from(estimates)
                .innerJoin(projects, eq(projects.id, estimates.projectId))
                .where(and(eq(estimates.id, estimateId), withActiveTenant(estimates, teamId), withActiveTenant(projects, teamId)))
                .limit(1)
                .then((rows) => rows[0]);

            if (!estimateRecord) {
                return error('Смета не найдена', 'NOT_FOUND');
            }

            const rowsRaw = await db
                .select({
                    id: estimateRows.id,
                    kind: estimateRows.kind,
                    parentWorkId: estimateRows.parentWorkId,
                    code: estimateRows.code,
                    name: estimateRows.name,
                    imageUrl: estimateRows.imageUrl,
                    unit: estimateRows.unit,
                    qty: estimateRows.qty,
                    price: estimateRows.price,
                    sum: estimateRows.sum,
                    expense: estimateRows.expense,
                    order: estimateRows.order,
                })
                .from(estimateRows)
                .where(and(eq(estimateRows.estimateId, estimateId), withActiveTenant(estimateRows, teamId)))
                .orderBy(estimateRows.order);

            const parsedRows = z.array(estimateExportRowSchema).safeParse(rowsRaw);
            if (!parsedRows.success) {
                return error('Ошибка формирования данных для экспорта', 'VALIDATION_ERROR');
            }

            const totals = computeTotals(parsedRows.data);

            return success({
                estimateId: estimateRecord.id,
                estimateName: estimateRecord.name,
                projectName: estimateRecord.projectName,
                rows: parsedRows.data,
                totals,
            });
        } catch (serviceError) {
            console.error('EstimateExportService.buildPayload error:', serviceError);
            return error('Не удалось сформировать данные для экспорта');
        }
    }

    static async exportXlsx(payload: EstimateExportPayload): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Смета', {
            views: [{ state: 'frozen', ySplit: 4 }],
        });

        worksheet.columns = [
            { header: 'Код', key: 'code', width: 12 },
            { header: 'Наименование', key: 'name', width: 48 },
            { header: 'Превью', key: 'preview', width: 14 },
            { header: 'Ед.', key: 'unit', width: 10 },
            { header: 'Кол-во', key: 'qty', width: 12 },
            { header: 'Цена', key: 'price', width: 14 },
            { header: 'Сумма', key: 'sum', width: 16 },
            { header: 'Расход', key: 'expense', width: 12 },
        ];

        worksheet.mergeCells('A1:H1');
        worksheet.getCell('A1').value = `Проект: ${payload.projectName}`;
        worksheet.getCell('A1').font = { bold: true, size: 12 };

        worksheet.mergeCells('A2:H2');
        worksheet.getCell('A2').value = `Смета: ${payload.estimateName}`;

        worksheet.mergeCells('A3:H3');
        worksheet.getCell('A3').value = `Дата экспорта: ${new Date().toLocaleString('ru-RU')}`;

        const headerRow = worksheet.getRow(4);
        headerRow.values = ['Код', 'Наименование', 'Превью', 'Ед.', 'Кол-во', 'Цена', 'Сумма', 'Расход'];
        headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFEFEFEF' },
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
                bottom: { style: 'thin' },
            };
        });

        const imageMap = new Map<string, DownloadedImage | null>();
        const materialRows = payload.rows.filter((row) => row.kind === 'material' && row.imageUrl);

        await Promise.all(materialRows.map(async (row) => {
            const image = row.imageUrl ? await downloadImage(row.imageUrl) : null;
            imageMap.set(row.id, image);
        }));

        let rowIndex = 5;
        for (const row of payload.rows) {
            const excelRow = worksheet.getRow(rowIndex);
            excelRow.getCell(1).value = row.code;
            excelRow.getCell(2).value = row.kind === 'material' ? `   ${row.name}` : row.name;
            excelRow.getCell(4).value = row.unit;
            excelRow.getCell(5).value = row.qty;
            excelRow.getCell(6).value = row.price;
            excelRow.getCell(7).value = row.sum;
            excelRow.getCell(8).value = row.kind === 'material' ? row.expense : null;

            if (row.kind === 'work') {
                excelRow.eachCell((cell) => {
                    cell.font = { bold: true };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF8FAFC' },
                    };
                });
            }

            excelRow.height = row.kind === 'material' ? 44 : 24;

            const image = imageMap.get(row.id);
            if (image) {
                const imageId = workbook.addImage({
                    base64: `data:image/${image.extension};base64,${image.buffer.toString('base64')}`,
                    extension: image.extension,
                });
                worksheet.addImage(imageId, {
                    tl: { col: 2.1, row: rowIndex - 1 + 0.1 },
                    ext: { width: 42, height: 42 },
                });
            }

            for (let col = 1; col <= 8; col += 1) {
                const cell = excelRow.getCell(col);
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: col >= 5 ? 'right' : 'left',
                    wrapText: col === 2,
                };

                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' },
                    bottom: { style: 'thin' },
                };

                if (col === 6 || col === 7) {
                    cell.numFmt = CURRENCY_FORMAT;
                }
            }

            rowIndex += 1;
        }

        const addTotalRow = (label: string, value: number) => {
            const row = worksheet.getRow(rowIndex);
            row.getCell(1).value = label;
            worksheet.mergeCells(`A${rowIndex}:F${rowIndex}`);
            row.getCell(7).value = value;
            row.getCell(1).font = { bold: true };
            row.getCell(7).font = { bold: true };
            row.getCell(7).numFmt = CURRENCY_FORMAT;
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' },
                    bottom: { style: 'thin' },
                };
            });
            rowIndex += 1;
        };

        rowIndex += 1;
        addTotalRow('Итого работы', payload.totals.works);
        addTotalRow('Итого материалы', payload.totals.materials);
        addTotalRow('Итого смета', payload.totals.grand);

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    static async exportPdf(payload: EstimateExportPayload): Promise<Buffer> {
        const document = await PDFDocument.create();
        const page = document.addPage([842, 595]);
        const font = await document.embedFont(StandardFonts.Helvetica);
        const bold = await document.embedFont(StandardFonts.HelveticaBold);

        let y = 560;
        page.drawText(`Проект: ${payload.projectName}`, { x: 32, y, size: 12, font: bold });
        y -= 18;
        page.drawText(`Смета: ${payload.estimateName}`, { x: 32, y, size: 11, font });
        y -= 16;
        page.drawText(`Дата экспорта: ${new Date().toLocaleString('ru-RU')}`, { x: 32, y, size: 10, font, color: rgb(0.35, 0.35, 0.35) });

        y -= 24;
        page.drawText('Код', { x: 32, y, size: 9, font: bold });
        page.drawText('Наименование', { x: 90, y, size: 9, font: bold });
        page.drawText('Ед.', { x: 490, y, size: 9, font: bold });
        page.drawText('Кол-во', { x: 530, y, size: 9, font: bold });
        page.drawText('Сумма', { x: 610, y, size: 9, font: bold });

        y -= 14;
        for (const row of payload.rows) {
            if (y < 60) {
                break;
            }

            page.drawText(row.code, { x: 32, y, size: 8, font });
            page.drawText(`${row.kind === 'material' ? '· ' : ''}${row.name}`.slice(0, 68), { x: 90, y, size: 8, font: row.kind === 'work' ? bold : font });
            page.drawText(row.unit.slice(0, 6), { x: 490, y, size: 8, font });
            page.drawText(row.qty.toLocaleString('ru-RU'), { x: 530, y, size: 8, font });
            page.drawText(`${Math.round(row.sum).toLocaleString('ru-RU')} ₽`, { x: 610, y, size: 8, font: row.kind === 'work' ? bold : font });
            y -= 12;
        }

        y -= 8;
        page.drawText(`Итого работы: ${Math.round(payload.totals.works).toLocaleString('ru-RU')} ₽`, { x: 32, y, size: 10, font: bold });
        y -= 14;
        page.drawText(`Итого материалы: ${Math.round(payload.totals.materials).toLocaleString('ru-RU')} ₽`, { x: 32, y, size: 10, font: bold });
        y -= 14;
        page.drawText(`Итого смета: ${Math.round(payload.totals.grand).toLocaleString('ru-RU')} ₽`, { x: 32, y, size: 11, font: bold });

        const bytes = await document.save();
        return Buffer.from(bytes);
    }

    static buildFilename(payload: EstimateExportPayload, format: EstimateExportFormat): string {
        const estimate = safeFileName(payload.estimateName);
        const project = safeFileName(payload.projectName);
        return `${project}-${estimate}.${format}`;
    }
}

export const __estimateExportServiceInternal = {
    computeTotals,
};
