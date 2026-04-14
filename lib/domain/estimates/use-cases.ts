import { createEstimate as createEstimateInRepo } from '@/lib/data/estimates/repo';
import { type NewEstimate } from '@/lib/data/db/schema';

export async function createEstimateUseCase(input: NewEstimate) {
    if (input.name.trim().length < 2) {
        throw new Error('Название сметы должно содержать минимум 2 символа');
    }

    return await createEstimateInRepo(input);
}
