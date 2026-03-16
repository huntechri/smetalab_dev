import ExcelJS from 'exceljs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/data/db/drizzle';
import { withActiveTenant } from '@/lib/data/db/queries';
import { estimateRows, estimates, projects } from '@/lib/data/db/schema';
import { Result, error, success } from '@/lib/utils/result';
import { applyEstimateCoefficient } from '@/lib/utils/estimate-coefficient';

const exportFormatSchema = z.enum(['xlsx', 'pdf']);

export type EstimateExportFormat = z.infer<typeof exportFormatSchema>;

const estimateExportRowSchema = z.object({
    id: z.string(),
    kind: z.enum(['section', 'work', 'material']),
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



type SectionTotalsBreakdown = {
    works: number;
    materials: number;
    total: number;
};

type SectionDisplayTotals = {
    bySectionId: Map<string, SectionTotalsBreakdown>;
    rowSumById: Map<string, number>;
};

function computeSectionDisplayTotals(rows: EstimateExportRow[]): SectionDisplayTotals {
    const sorted = rows.slice().sort((left, right) => left.order - right.order);
    const bySectionId = new Map<string, SectionTotalsBreakdown>();
    const rowSumById = new Map<string, number>();
    let currentSectionId: string | null = null;

    for (const row of sorted) {
        if (row.kind === 'section') {
            currentSectionId = row.id;
            if (!bySectionId.has(row.id)) {
                bySectionId.set(row.id, { works: 0, materials: 0, total: 0 });
            }
            rowSumById.set(row.id, 0);
            continue;
        }

        rowSumById.set(row.id, row.sum);

        if (currentSectionId) {
            const sectionTotals = bySectionId.get(currentSectionId) ?? { works: 0, materials: 0, total: 0 };
            const nextTotals: SectionTotalsBreakdown = {
                works: row.kind === 'work' ? sectionTotals.works + row.sum : sectionTotals.works,
                materials: row.kind === 'material' ? sectionTotals.materials + row.sum : sectionTotals.materials,
                total: sectionTotals.total + row.sum,
            };

            bySectionId.set(currentSectionId, nextTotals);
        }
    }

    for (const row of sorted) {
        if (row.kind === 'section') {
            rowSumById.set(row.id, bySectionId.get(row.id)?.total ?? 0);
        }
    }

    return { bySectionId, rowSumById };
}

type DownloadedImage = {
    buffer: Buffer;
    extension: 'jpeg' | 'png';
};

const CURRENCY_FORMAT = '#,##0.00 [$₽-419]';
const WORK_ROW_BASE_HEIGHT = 24;
const MATERIAL_IMAGE_SIZE = 34;
const MATERIAL_IMAGE_COLUMN_WIDTH_CHARS = 14;
const MATERIAL_ROW_HEIGHT_POINTS = 44;

function estimateColumnWidthPixels(columnWidthChars: number): number {
    return Math.floor(columnWidthChars * 7 + 5);
}

function pointsToPixels(points: number): number {
    return points * (96 / 72);
}

function getCenteredImageAnchor(rowIndex: number): { col: number; row: number } {
    const columnWidthPx = estimateColumnWidthPixels(MATERIAL_IMAGE_COLUMN_WIDTH_CHARS);
    const rowHeightPx = pointsToPixels(MATERIAL_ROW_HEIGHT_POINTS);

    const offsetX = Math.max(0, (columnWidthPx - MATERIAL_IMAGE_SIZE) / 2);
    const offsetY = Math.max(0, (rowHeightPx - MATERIAL_IMAGE_SIZE) / 2);

    return {
        col: 3 + (columnWidthPx > 0 ? offsetX / columnWidthPx : 0),
        row: (rowIndex - 1) + (rowHeightPx > 0 ? offsetY / rowHeightPx : 0),
    };
}

function calculateWorkRowHeight(name: string): number {
    const normalized = name.trim();
    if (normalized.length === 0) {
        return WORK_ROW_BASE_HEIGHT;
    }

    const linesByLength = Math.ceil(normalized.length / 58);
    const lineBreakCount = normalized.split('\n').length;
    const estimatedLines = Math.max(linesByLength, lineBreakCount);
    return Math.max(WORK_ROW_BASE_HEIGHT, estimatedLines * 16);
}

const RU_TO_LATIN_MAP: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

function transliterateRu(input: string): string {
    return input
        .split('')
        .map((char) => {
            const lower = char.toLowerCase();
            const mapped = RU_TO_LATIN_MAP[lower];
            return mapped ?? lower;
        })
        .join('');
}

function safeFileName(name: string): string {
    const transliterated = transliterateRu(name.trim().toLowerCase());

    return transliterated
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'estimate';
}


function toPdfSafeText(value: string): string {
    return transliterateRu(value);
}

function computeTotals(rows: EstimateExportRow[]) {
    const totals = rows.reduce((acc, row) => {
        if (row.kind === 'work') {
            acc.works += row.sum;
        } else if (row.kind === 'material') {
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
                    coefPercent: estimates.coefPercent,
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

            const coefPercent = estimateRecord.coefPercent ?? 0;
            const rowsWithCoef = parsedRows.data.map((row) => {
                if (row.kind !== 'work') {
                    return row;
                }

                const effectivePrice = applyEstimateCoefficient(row.price, coefPercent);
                return {
                    ...row,
                    price: effectivePrice,
                    sum: effectivePrice * row.qty,
                };
            });

            const totals = computeTotals(rowsWithCoef);

            return success({
                estimateId: estimateRecord.id,
                estimateName: estimateRecord.name,
                projectName: estimateRecord.projectName,
                rows: rowsWithCoef,
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
            { header: 'Тип', key: 'kind', width: 12 },
            { header: 'Наименование', key: 'name', width: 60 },
            { header: 'Изображение', key: 'preview', width: 14 },
            { header: 'Ед.', key: 'unit', width: 10 },
            { header: 'Кол-во', key: 'qty', width: 12 },
            { header: 'Цена', key: 'price', width: 14 },
            { header: 'Сумма', key: 'sum', width: 16 },
        ];

        worksheet.mergeCells('A1:H1');
        worksheet.getCell('A1').value = `Проект: ${payload.projectName}`;
        worksheet.getCell('A1').font = { bold: true, size: 12 };

        worksheet.mergeCells('A2:H2');
        worksheet.getCell('A2').value = `Смета: ${payload.estimateName}`;

        worksheet.mergeCells('A3:H3');
        worksheet.getCell('A3').value = `Дата экспорта: ${new Date().toLocaleString('ru-RU')}`;

        const headerRow = worksheet.getRow(4);
        headerRow.values = ['Код', 'Тип', 'Наименование', 'Изображение', 'Ед.', 'Кол-во', 'Цена', 'Сумма'];
        headerRow.eachCell((cell: ExcelJS.Cell) => {
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
        const sectionRanges: Array<{ code: string; name: string; startRow: number; endRow: number }> = [];
        const materialRows = payload.rows.filter((row) => row.kind === 'material' && row.imageUrl);

        await Promise.all(materialRows.map(async (row) => {
            const image = row.imageUrl ? await downloadImage(row.imageUrl) : null;
            imageMap.set(row.id, image);
        }));

        const writeSectionSubtotalRows = (
            section: { code: string; name: string } | null,
            startRow: number | null,
            endRow: number,
            currentRowIndex: number,
        ): number => {
            if (!section || startRow === null) {
                return currentRowIndex;
            }

            if (endRow >= startRow) {
                sectionRanges.push({
                    code: section.code,
                    name: section.name,
                    startRow,
                    endRow,
                });
            }

            const createFormula = (kindLabel: 'Работа' | 'Материал') => {
                if (endRow < startRow) {
                    return '0';
                }

                return `SUMIFS($H$${startRow}:$H$${endRow},$B$${startRow}:$B$${endRow},"${kindLabel}")`;
            };

            const addSubtotalRow = (suffix: 'работы' | 'материал', kindLabel: 'Работа' | 'Материал') => {
                const subtotalRow = worksheet.getRow(currentRowIndex);
                subtotalRow.getCell(1).value = section.code;
                subtotalRow.getCell(2).value = 'Раздел';
                subtotalRow.getCell(3).value = `Итого по разделу № ${section.code} (${suffix})`;
                subtotalRow.getCell(8).value = { formula: createFormula(kindLabel) };
                subtotalRow.getCell(8).numFmt = CURRENCY_FORMAT;

                subtotalRow.eachCell((cell: ExcelJS.Cell) => {
                    cell.font = { bold: true, color: { argb: 'FF1E3A8A' } };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF1F5F9' },
                    };
                });

                for (let col = 1; col <= 8; col += 1) {
                    const cell = subtotalRow.getCell(col);
                    cell.alignment = {
                        vertical: 'middle',
                        horizontal: col >= 6 ? 'right' : 'left',
                        wrapText: col === 3,
                    };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        right: { style: 'thin' },
                        bottom: { style: 'thin' },
                    };
                }

                currentRowIndex += 1;
            };

            addSubtotalRow('работы', 'Работа');
            addSubtotalRow('материал', 'Материал');
            return currentRowIndex;
        };

        let rowIndex = 5;
        let activeSection: { code: string; name: string } | null = null;
        let activeSectionDataStartRow: number | null = null;

        for (const row of payload.rows) {
            if (row.kind === 'section') {
                rowIndex = writeSectionSubtotalRows(activeSection, activeSectionDataStartRow, rowIndex - 1, rowIndex);
                activeSection = { code: row.code, name: row.name };
                activeSectionDataStartRow = null;
            }

            const excelRow = worksheet.getRow(rowIndex);
            excelRow.getCell(1).value = row.code;
            const kindLabel = row.kind === 'section' ? 'Раздел' : row.kind === 'work' ? 'Работа' : 'Материал';
            excelRow.getCell(2).value = kindLabel;
            excelRow.getCell(3).value = row.kind === 'material' ? `   ${row.name}` : row.name;
            excelRow.getCell(5).value = row.kind === 'section' ? '' : row.unit;
            excelRow.getCell(6).value = row.kind === 'section' ? '' : row.qty;
            excelRow.getCell(7).value = row.kind === 'section' ? '' : row.price;
            excelRow.getCell(8).value = row.kind === 'section' ? '' : { formula: `F${rowIndex}*G${rowIndex}` };

            if (row.kind !== 'section' && activeSectionDataStartRow === null) {
                activeSectionDataStartRow = rowIndex;
            }

            if (row.kind === 'section') {
                excelRow.eachCell((cell: ExcelJS.Cell) => {
                    cell.font = { bold: true, color: { argb: 'FF0F172A' } };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFE2E8F0' },
                    };
                });
            }

            if (row.kind === 'work') {
                excelRow.eachCell((cell: ExcelJS.Cell) => {
                    cell.font = { bold: true };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF8FAFC' },
                    };
                });
            }

            excelRow.height = row.kind === 'material'
                ? 44
                : row.kind === 'section'
                    ? 26
                    : calculateWorkRowHeight(row.name);

            const image = imageMap.get(row.id);
            if (image) {
                const imageAnchor = getCenteredImageAnchor(rowIndex);
                const imageId = workbook.addImage({
                    base64: `data:image/${image.extension};base64,${image.buffer.toString('base64')}`,
                    extension: image.extension,
                });
                worksheet.addImage(imageId, {
                    tl: imageAnchor,
                    ext: { width: MATERIAL_IMAGE_SIZE, height: MATERIAL_IMAGE_SIZE },
                });
            }

            for (let col = 1; col <= 8; col += 1) {
                const cell = excelRow.getCell(col);
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: col >= 6 ? 'right' : 'left',
                    wrapText: col === 3,
                };

                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' },
                    bottom: { style: 'thin' },
                };

                if ((col === 7 || col === 8) && row.kind !== 'section') {
                    cell.numFmt = CURRENCY_FORMAT;
                }
            }

            rowIndex += 1;
        }

        rowIndex = writeSectionSubtotalRows(activeSection, activeSectionDataStartRow, rowIndex - 1, rowIndex);

        if (sectionRanges.length > 0) {
            rowIndex += 1;

            const summaryTitleRow = worksheet.getRow(rowIndex);
            summaryTitleRow.getCell(3).value = 'Общие итоги по разделам';
            summaryTitleRow.getCell(3).font = { bold: true, color: { argb: 'FF0F172A' } };
            summaryTitleRow.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
            rowIndex += 1;

            const addSummaryRow = (
                sectionRange: { code: string; name: string; startRow: number; endRow: number },
                suffix: 'работы' | 'материалы',
                kindLabel: 'Работа' | 'Материал',
            ) => {
                const summaryRow = worksheet.getRow(rowIndex);
                summaryRow.getCell(1).value = sectionRange.code;
                summaryRow.getCell(2).value = 'Раздел';
                summaryRow.getCell(3).value = `Итого раздела № ${sectionRange.code} (${suffix})`;
                summaryRow.getCell(8).value = {
                    formula: `SUMIFS($H$${sectionRange.startRow}:$H$${sectionRange.endRow},$B$${sectionRange.startRow}:$B$${sectionRange.endRow},"${kindLabel}")`,
                };
                summaryRow.getCell(8).numFmt = CURRENCY_FORMAT;

                for (let col = 1; col <= 8; col += 1) {
                    const cell = summaryRow.getCell(col);
                    cell.font = { bold: true, color: { argb: 'FF14532D' } };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFECFDF5' },
                    };
                    cell.alignment = {
                        vertical: 'middle',
                        horizontal: col >= 6 ? 'right' : 'left',
                        wrapText: col === 3,
                    };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        right: { style: 'thin' },
                        bottom: { style: 'thin' },
                    };
                }

                rowIndex += 1;
            };

            for (const sectionRange of sectionRanges) {
                addSummaryRow(sectionRange, 'работы', 'Работа');
                addSummaryRow(sectionRange, 'материалы', 'Материал');
            }
        }

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    static async exportPdf(payload: EstimateExportPayload): Promise<Buffer> {
        const document = await PDFDocument.create();
        const page = document.addPage([842, 595]);
        const font = await document.embedFont(StandardFonts.Helvetica);
        const bold = await document.embedFont(StandardFonts.HelveticaBold);

        let y = 560;
        page.drawText(`Proekt: ${toPdfSafeText(payload.projectName)}`, { x: 32, y, size: 12, font: bold });
        y -= 18;
        page.drawText(`Smeta: ${toPdfSafeText(payload.estimateName)}`, { x: 32, y, size: 11, font });
        y -= 16;
        page.drawText(`Data exporta: ${new Date().toLocaleString('ru-RU')}`, { x: 32, y, size: 10, font, color: rgb(0.35, 0.35, 0.35) });

        y -= 24;
        page.drawText('Kod', { x: 32, y, size: 9, font: bold });
        page.drawText('Naimenovanie', { x: 90, y, size: 9, font: bold });
        page.drawText('Tip', { x: 430, y, size: 9, font: bold });
        page.drawText('Ed.', { x: 490, y, size: 9, font: bold });
        page.drawText('Kol-vo', { x: 530, y, size: 9, font: bold });
        page.drawText('Summa', { x: 610, y, size: 9, font: bold });

        const displayTotals = computeSectionDisplayTotals(payload.rows);

        y -= 14;
        for (const row of payload.rows) {
            const displaySum = displayTotals.rowSumById.get(row.id) ?? row.sum;
            const sectionBreakdown = row.kind === 'section'
                ? (displayTotals.bySectionId.get(row.id) ?? { works: 0, materials: 0, total: displaySum })
                : null;
            if (y < 60) {
                break;
            }

            page.drawText(row.code, { x: 32, y, size: 8, font });
            page.drawText(`${row.kind === 'material' ? '- ' : ''}${toPdfSafeText(row.name)}`.slice(0, 64), { x: 90, y, size: 8, font: row.kind === 'section' ? bold : row.kind === 'work' ? bold : font });
            page.drawText(row.kind === 'section' ? 'Razdel' : row.kind === 'work' ? 'Rabota' : 'Material', { x: 430, y, size: 8, font });
            page.drawText(row.kind === 'section' ? '' : toPdfSafeText(row.unit).slice(0, 6), { x: 490, y, size: 8, font });
            page.drawText(row.kind === 'section' ? '' : row.qty.toLocaleString('ru-RU'), { x: 530, y, size: 8, font });
            page.drawText(
                row.kind === 'section'
                    ? `R:${Math.round(sectionBreakdown?.works ?? 0).toLocaleString('ru-RU')} M:${Math.round(sectionBreakdown?.materials ?? 0).toLocaleString('ru-RU')} RUB`
                    : `${Math.round(displaySum).toLocaleString('ru-RU')} RUB`,
                { x: 610, y, size: 8, font: row.kind === 'section' || row.kind === 'work' ? bold : font },
            );
            y -= 12;
        }

        y -= 8;
        page.drawText(`Itogo raboty: ${Math.round(payload.totals.works).toLocaleString('ru-RU')} RUB`, { x: 32, y, size: 10, font: bold });
        y -= 14;
        page.drawText(`Itogo materialy: ${Math.round(payload.totals.materials).toLocaleString('ru-RU')} RUB`, { x: 32, y, size: 10, font: bold });
        y -= 14;
        page.drawText(`Itogo smeta: ${Math.round(payload.totals.grand).toLocaleString('ru-RU')} RUB`, { x: 32, y, size: 11, font: bold });

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
    computeSectionDisplayTotals,
};
