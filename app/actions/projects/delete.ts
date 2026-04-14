'use server';

import { revalidatePath } from 'next/cache';
import { deleteProject } from '@/lib/data/projects/repo';
import { safeAction } from '@/lib/actions/safe-action';
import { error, success } from '@/lib/utils/result';

export const deleteProjectAction = safeAction(
    async ({ team }, projectId: string) => {
        try {
            const deleted = await deleteProject(projectId, team.id);

            if (!deleted) {
                return error('Проект не найден или у вас нет прав на его удаление', 'PROJECT_NOT_FOUND');
            }

            revalidatePath('/app');
            revalidatePath('/app/projects');
            return success(true);
        } catch (err) {
            console.error('Failed to delete project:', err);
            return error('Не удалось удалить проект', 'PROJECT_DELETE_FAILED');
        }
    },
    { name: 'deleteProjectAction' }
);
