'use server';

import { revalidatePath } from 'next/cache';
import { MaterialsService } from '@/lib/domain/materials/materials.service';
import { safeAction } from '@/lib/actions/safe-action';
import { success, error } from '@/lib/utils/result';
import { after } from 'next/server';
import { MaterialsImportExportService } from '@/lib/services/materials-import-export.service';


export const importMaterials = safeAction(async function importMaterialsHandler({ team }, formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        return error('Файл не найден');
    }

    const result = await MaterialsImportExportService.importFromFile(team.id, file);
    if (result.success) {
        MaterialsService.enqueueImageDownloads(team.id, result.data.materialsToUpsert);

        after(async () => {
            try {
                await MaterialsService.generateMissingEmbeddings(team.id);
            } catch (err) {
                console.error('Background import embedding generation failed:', err);
            }
        });

        revalidatePath('/app/guide/materials');
        return success(undefined, result.data.summaryMessage);
    }
    return result;
}, { name: 'importMaterials' });

export const exportMaterials = safeAction(async function exportMaterialsHandler({ team }) {
    return MaterialsImportExportService.exportForTeam(team.id);
}, { name: 'exportMaterials' });

export const resetMaterialImages = safeAction(async function resetMaterialImagesHandler({ team }) {
    const result = await MaterialsService.resetLocalImages(team.id);
    if (result.success) {
        revalidatePath('/app/guide/materials');
    }
    return result;
}, { name: 'resetMaterialImages' });
