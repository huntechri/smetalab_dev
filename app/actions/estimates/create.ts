'use server';

import { revalidatePath } from 'next/cache';
import { createEstimateSchema } from '@/features/projects/estimates/schemas/create-estimate.schema';
import { createEstimateUseCase } from '@/lib/domain/estimates/use-cases';
import { getTeamForUser } from '@/lib/data/db/queries';
import { NewEstimate } from '@/lib/data/db/schema';
import { generateUniqueSlug } from '@/lib/utils/slug';

export async function createEstimateAction(formData: unknown) {
    const team = await getTeamForUser();
    if (!team) {
        return { error: 'Команда не найдена или вы не авторизованы' };
    }

    const validated = createEstimateSchema.safeParse(formData);
    if (!validated.success) {
        return { error: 'Невалидные данные', details: validated.error.flatten().fieldErrors };
    }

    const { name, projectId } = validated.data;

    try {
        const estimateData: NewEstimate = {
            tenantId: team.id,
            projectId,
            name: name.trim(),
            slug: generateUniqueSlug(name),
            status: 'draft',
            total: 0,
        };

        const created = await createEstimateUseCase(estimateData);

        revalidatePath(`/app/projects/${projectId}`);
        return { success: true, data: created };
    } catch (err) {
        console.error('Failed to create estimate:', err);
        return { error: 'Не удалось создать смету' };
    }
}
