import { z } from 'zod';

export const createEstimateSchema = z.object({
    name: z.string().min(2, 'Название сметы должно быть не менее 2 символов').max(200, 'Слишком длинное название'),
    projectId: z.string().uuid('Некорректный ID проекта'),
});

export type CreateEstimateInput = z.infer<typeof createEstimateSchema>;
