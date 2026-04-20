import { ProjectListItem, ProjectSortOption } from '../types';

export function sortProjects(projects: ProjectListItem[], sortOption: ProjectSortOption): ProjectListItem[] {
    const sortedProjects = [...projects];

    sortedProjects.sort((left, right) => {
        if (sortOption === 'name') {
            return left.name.localeCompare(right.name, 'ru-RU');
        }

        if (sortOption === 'contractAmount') {
            return right.contractAmount - left.contractAmount;
        }

        if (sortOption === 'startDate') {
            return new Date(right.startDate).getTime() - new Date(left.startDate).getTime();
        }

        if (sortOption === 'endDate') {
            return new Date(left.endDate).getTime() - new Date(right.endDate).getTime();
        }

        return right.progress - left.progress;
    });

    return sortedProjects;
}
