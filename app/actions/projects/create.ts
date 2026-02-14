'use server';

import { revalidatePath } from 'next/cache';
import { createProjectSchema } from '@/features/projects/shared/schemas/create-project.schema';
import { createProjectUseCase } from '@/lib/domain/projects/use-cases';
import { getTeamForUser, getCounterparties } from '@/lib/data/db/queries';
import { NewProject } from '@/lib/data/db/schema';
import { generateUniqueSlug } from '@/lib/utils/slug';

export async function createProjectAction(formData: unknown) {
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
        const projectData: NewProject = {
            tenantId: team.id,
            name,
            slug: generateUniqueSlug(name),
            counterpartyId: counterpartyId,
            customerName: cp?.name || null,
            status: 'planned',
            startDate: startDate || null,
            endDate: endDate || null,
        };

        await createProjectUseCase(projectData);

        revalidatePath('/app/projects');
        return { success: true };
    } catch (err) {
        console.error('Failed to create project:', err);
        return { error: 'Не удалось создать проект' };
    }
}
