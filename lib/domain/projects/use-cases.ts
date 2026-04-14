import { createProject as createProjectInRepo } from '@/lib/data/projects/repo';
import { type NewProject } from '@/lib/data/db/schema';

export async function createProjectUseCase(input: NewProject) {
    // Add any business rules here (e.g., limit checks, naming conventions)
    if (input.name.length < 2) {
        throw new Error('Project name is too short');
    }

    return await createProjectInRepo(input);
}
