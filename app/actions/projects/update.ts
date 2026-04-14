'use server';

import { revalidatePath } from 'next/cache';
import { createProjectSchema } from '@/features/projects/shared/schemas/create-project.schema';
import { db } from '@/lib/data/db/drizzle';
import { projects } from '@/lib/data/db/schema';
import { eq, and } from 'drizzle-orm';
import { withActiveTenant, getCounterparties } from '@/lib/data/db/queries';
import { safeAction } from '@/lib/actions/safe-action';
import { error, success } from '@/lib/utils/result';

export const updateProjectAction = safeAction(
    async ({ team }, projectId: string, formData: unknown) => {
        const validated = createProjectSchema.safeParse(formData);
        if (!validated.success) {
            return error('Невалидные данные', 'VALIDATION_ERROR', validated.error.flatten().fieldErrors);
        }

        const { name, counterpartyId, objectAddress, startDate, endDate } = validated.data;

        const { data: counterparties } = await getCounterparties(team.id, { search: '' });
        const cp = counterparties.find(c => c.id === counterpartyId);

        try {
            await db
                .update(projects)
                .set({
                    name,
                    counterpartyId,
                    customerName: cp?.name || null,
                    objectAddress: objectAddress?.trim() ? objectAddress.trim() : null,
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

            revalidatePath('/app');
            revalidatePath('/app/projects');
            return success(true);
        } catch (err) {
            console.error('Failed to update project:', err);
            return error('Не удалось обновить проект', 'PROJECT_UPDATE_FAILED');
        }
    },
    { name: 'updateProjectAction' }
);
