import { z } from 'zod';

export const createProjectSchema = z.object({
    name: z.string().min(2, 'Название проекта должно быть не менее 2 символов').max(120),
    counterpartyId: z.string().uuid('Необходимо выбрать контрагента'),
    objectAddress: z.string().max(500, 'Адрес не должен превышать 500 символов').optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
