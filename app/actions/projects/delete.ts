'use server';

import { revalidatePath } from 'next/cache';
import { deleteProject } from '@/lib/data/projects/repo';
import { getTeamForUser } from '@/lib/data/db/queries';

export async function deleteProjectAction(projectId: string) {
    const team = await getTeamForUser();
    if (!team) {
        return { error: 'Команда не найдена или вы не авторизованы' };
    }

    try {
        const deleted = await deleteProject(projectId, team.id);

        if (!deleted) {
            return { error: 'Проект не найден или у вас нет прав на его удаление' };
        }

        revalidatePath('/app/projects');
        return { success: true };
    } catch (err) {
        console.error('Failed to delete project:', err);
        return { error: 'Не удалось удалить проект' };
    }
}
