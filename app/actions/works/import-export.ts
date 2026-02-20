'use server';

import { revalidatePath } from 'next/cache';
import { WorksService } from '@/lib/domain/works/works.service';
import { safeAction } from '@/lib/actions/safe-action';
import { error, success } from '@/lib/utils/result';
import { after } from 'next/server';
import { WorksImportExportService } from '@/lib/services/works-import-export.service';


export const importWorks = safeAction(async function importWorksHandler({ team }, formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) return error('Файл не найден');

    const result = await WorksImportExportService.importFromFile(team.id, file);
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
        return success(undefined, result.data.summaryMessage);
    }
    return result;
}, { name: 'importWorks' });

export const exportWorks = safeAction(async function exportWorksHandler({ team }) {
    return WorksImportExportService.exportForTeam(team.id);
}, { name: 'exportWorks' });
