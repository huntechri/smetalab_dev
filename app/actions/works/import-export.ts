'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/data/db/drizzle';
import { works, NewWork } from '@/lib/data/db/schema';
import { and, eq } from 'drizzle-orm';
import { WorksService } from '@/lib/domain/works/works.service';
import { safeAction } from '@/lib/actions/safe-action';
import { ExcelService } from '@/lib/services/excel.service';
import { error, success } from '@/lib/utils/result';
import { worksHeaderMap, worksRequiredFields } from '@/lib/constants/import-configs';
import { after } from 'next/server';
import { withActiveTenant } from '@/lib/data/db/queries';


export const importWorks = safeAction(async function importWorksHandler({ team }, formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) return error('Файл не найден');

    const buffer = Buffer.from(await file.arrayBuffer());
    const parseResult = await ExcelService.parseBuffer<Record<string, unknown>>(buffer, {
        headerMap: worksHeaderMap,
        requiredFields: worksRequiredFields
    });

    if (!parseResult.success) return parseResult;

    const { data: parsedRows, summary } = parseResult.data;

    const newWorks: NewWork[] = parsedRows.map(row => ({
        tenantId: team.id,
        code: String(row.code),
        name: String(row.name),
        unit: row.unit ? String(row.unit) : undefined,
        price: row.price ? Number(row.price) : undefined,
        phase: row.phase ? String(row.phase) : undefined,
        category: row.category ? String(row.category) : undefined,
        subcategory: row.subcategory ? String(row.subcategory) : undefined,
        shortDescription: row.shortDescription ? String(row.shortDescription) : undefined,
        description: row.description ? String(row.description) : undefined,
        status: 'active',
    }));

    const result = await WorksService.upsertMany(team.id, newWorks);
    if (result.success) {
        // Trigger background embedding generation
        after(async () => {
            try {
                await WorksService.generateMissingEmbeddings(team.id);
            } catch (err) {
                console.error('Background import embedding generation (works) failed:', err);
            }
        });

        revalidatePath('/app/guide/works');
        const summaryMsg = `Импорт завершен. Успешно: ${summary.success}, Пропущено: ${summary.skipped}`;
        return success(undefined, summaryMsg);
    }
    return result;
}, { name: 'importWorks' });

export const exportWorks = safeAction(async function exportWorksHandler({ team }) {
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
        .where(and(withActiveTenant(works, team.id), eq(works.status, 'active')));

    return success(worksData);
}, { name: 'exportWorks' });
