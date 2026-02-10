'use server';

import { revalidatePath } from 'next/cache';
import { NewWork } from '@/lib/data/db/schema';
import {
    createWorkUseCase,
    deleteAllWorksUseCase,
    deleteWorkUseCase,
    insertWorkAfterUseCase,
    updateWorkUseCase,
} from '@/lib/domain/works/use-cases';
import { safeAction } from '@/lib/actions/safe-action';

export const deleteWork = safeAction(async function deleteWorkHandler({ team }, id: string) {
    const result = await deleteWorkUseCase(team.id, id);
    if (result.success) {
        revalidatePath('/app/guide/works');
    }
    return result;
}, { name: 'deleteWork', allowedRoles: ['admin'] });

export const deleteAllWorks = safeAction(async function deleteAllWorksHandler({ team }) {
    const result = await deleteAllWorksUseCase(team.id);
    if (result.success) {
        revalidatePath('/app/guide/works');
    }
    return result;
}, { name: 'deleteAllWorks', allowedRoles: ['admin'] });

export const updateWork = safeAction(async function updateWorkHandler({ team }, id: string, data: Partial<NewWork>) {
    const result = await updateWorkUseCase(team.id, id, data);
    if (result.success) {
        revalidatePath('/app/guide/works');
    }
    return result;
}, { name: 'updateWork', allowedRoles: ['admin', 'manager'] });

export const createWork = safeAction(async function createWorkHandler({ team }, data: NewWork) {
    const result = await createWorkUseCase(team.id, data);
    if (result.success) {
        revalidatePath('/app/guide/works');
    }
    return result;
}, { name: 'createWork', allowedRoles: ['admin', 'manager'] });

export const insertWorkAfter = safeAction(async function insertWorkAfterHandler({ team }, afterId: string | null, data: NewWork) {
    const result = await insertWorkAfterUseCase(team.id, afterId, data);
    if (result.success) {
        revalidatePath('/app/guide/works');
    }
    return result;
}, { name: 'insertWorkAfter', allowedRoles: ['admin', 'manager'] });
