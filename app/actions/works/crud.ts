'use server';

import { revalidatePath } from 'next/cache';
import { NewWork } from '@/lib/data/db/schema';
import { safeAction } from '@/lib/actions/safe-action';
import { WorksCatalogService } from '@/lib/services/works-catalog.service';

export const deleteWork = safeAction(async function deleteWorkHandler({ team }, id: string) {
    const result = await WorksCatalogService.delete(team.id, id);
    if (result.success) {
        revalidatePath('/app/guide/works');
    }
    return result;
}, { name: 'deleteWork', allowedRoles: ['admin'] });

export const deleteAllWorks = safeAction(async function deleteAllWorksHandler({ team }) {
    const result = await WorksCatalogService.deleteAll(team.id);
    if (result.success) {
        revalidatePath('/app/guide/works');
    }
    return result;
}, { name: 'deleteAllWorks', allowedRoles: ['admin'] });

export const updateWork = safeAction(async function updateWorkHandler({ team }, id: string, data: Partial<NewWork>) {
    const result = await WorksCatalogService.update(team.id, id, data);
    if (result.success) {
        revalidatePath('/app/guide/works');
    }
    return result;
}, { name: 'updateWork', allowedRoles: ['admin', 'manager'] });

export const createWork = safeAction(async function createWorkHandler({ team }, data: NewWork) {
    const result = await WorksCatalogService.create(team.id, data);
    if (result.success) {
        revalidatePath('/app/guide/works');
    }
    return result;
}, { name: 'createWork', allowedRoles: ['admin', 'manager'] });

export const insertWorkAfter = safeAction(async function insertWorkAfterHandler({ team }, afterId: string | null, data: NewWork) {
    const result = await WorksCatalogService.insertAfter(team.id, afterId, data);
    if (result.success) {
        revalidatePath('/app/guide/works');
    }
    return result;
}, { name: 'insertWorkAfter', allowedRoles: ['admin', 'manager'] });
