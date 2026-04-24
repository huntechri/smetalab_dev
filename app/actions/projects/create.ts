'use server';

import { revalidatePath } from 'next/cache';
import { createProjectSchema } from '@/features/projects';
import { createProjectUseCase } from '@/lib/domain/projects/use-cases';
import { getCounterparties } from '@/lib/data/db/queries';
import { NewProject } from '@/lib/data/db/schema';
import { generateUniqueSlug } from '@/lib/utils/slug';
import { safeAction } from '@/lib/actions/safe-action';
import { error, success } from '@/lib/utils/result';
import { invalidateHomeDashboardCache } from '@/lib/services/home-dashboard-cache';

export const createProjectAction = safeAction(
    async ({ team }, formData: unknown) => {
        const validated = createProjectSchema.safeParse(formData);
        if (!validated.success) {
            return error('Невалидные данные', 'VALIDATION_ERROR', validated.error.flatten().fieldErrors);
        }

        const { name, counterpartyId, objectAddress, startDate, endDate } = validated.data;

        const { data: counterparties } = await getCounterparties(team.id, { search: '' });
        const cp = counterparties.find(c => c.id === counterpartyId);

        try {
            const projectData: NewProject = {
                tenantId: team.id,
                name,
                slug: generateUniqueSlug(name),
                counterpartyId,
                customerName: cp?.name || null,
                objectAddress: objectAddress?.trim() ? objectAddress.trim() : null,
                status: 'planned',
                startDate: startDate || null,
                endDate: endDate || null,
            };

            await createProjectUseCase(projectData);

            invalidateHomeDashboardCache(team.id);
            revalidatePath('/app');
            revalidatePath('/app/projects');
            return success(true);
        } catch (err) {
            console.error('Failed to create project:', err);
            return error('Не удалось создать проект', 'PROJECT_CREATE_FAILED');
        }
    },
    { name: 'createProjectAction' }
);
