import { ProjectListItem } from '../types';

export function filterProjects(projects: ProjectListItem[], query: string): ProjectListItem[] {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return projects;
    }

    return projects.filter((project) => {
        return project.name.toLowerCase().includes(normalizedQuery)
            || project.customerName.toLowerCase().includes(normalizedQuery);
    });
}
