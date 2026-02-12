'use server';

import { revalidatePath } from 'next/cache';
import { createProjectSchema } from '@/features/projects/schemas/create-project.schema';
import { db } from '@/lib/data/db/drizzle';
import { projects } from '@/lib/data/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTeamForUser, withActiveTenant, getCounterparties } from '@/lib/data/db/queries';

export async function updateProjectAction(projectId: string, formData: unknown) {
    const team = await getTeamForUser();
    if (!team) {
        return { error: 'Команда не найдена или вы не авторизованы' };
    }

    const validated = createProjectSchema.safeParse(formData);
    if (!validated.success) {
        return { error: 'Невалидные данные', details: validated.error.flatten().fieldErrors };
    }

    const { name, counterpartyId, startDate, endDate } = validated.data;

    const { data: counterparties } = await getCounterparties(team.id, { search: '' });
    const cp = counterparties.find(c => c.id === counterpartyId);

    try {
        await db
            .update(projects)
            .set({
                name,
                counterpartyId: counterpartyId,
                customerName: cp?.name || null,
                startDate: startDate || null,
                endDate: endDate || null,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(projects.id, projectId),
                    withActiveTenant(projects, team.id)
                )
            );

        revalidatePath('/app/projects');
        return { success: true };
    } catch (err) {
        console.error('Failed to update project:', err);
        return { error: 'Не удалось обновить проект' };
    }
}
