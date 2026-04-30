'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { deleteProjectAction } from '@/app/actions/projects/delete';
import { notify } from '@/lib/infrastructure/notifications/notify';
import { filterProjects } from '../../shared/utils/filter';
import { sortProjects } from '../../shared/utils/sort';
import { type ProjectListItem, type ProjectSortOption } from '../../shared/types';

const DEFAULT_SORT: ProjectSortOption = 'name';

type UseProjectsScreenOptions = {
    projects: ProjectListItem[];
    onEditProjectSelect: (project: ProjectListItem) => void;
    onAddProject: () => void;
};

export function useProjectsScreen({ projects, onEditProjectSelect, onAddProject }: UseProjectsScreenOptions) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const searchParamsString = searchParams.toString();

    const searchQuery = searchParams.get('q') ?? '';
    const sortOption = parseSortOption(searchParams.get('sort'));

    const visibleProjects = useMemo(() => {
        return sortProjects(filterProjects(projects, searchQuery), sortOption);
    }, [projects, searchQuery, sortOption]);

    useEffect(() => {
        if (!searchParams.has('view')) {
            return;
        }

        const queryString = createQueryParams(searchParamsString, { view: '' });
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    }, [pathname, router, searchParams, searchParamsString]);

    const updateQueryParams = (updates: Record<string, string>) => {
        const queryString = createQueryParams(searchParamsString, updates);
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    };

    const handleDeleteProject = async (projectId: string) => {
        try {
            const result = await deleteProjectAction(projectId);
            if (result.success) {
                notify({ title: 'Проект успешно удален', intent: 'success' });
                return true;
            }

            notify({ title: result.error?.message || 'Не удалось удалить проект', intent: 'error' });
            return false;
        } catch {
            notify({ title: 'Произошла непредвиденная ошибка', intent: 'error' });
            return false;
        }
    };

    const handleEditProject = (projectId: string) => {
        const project = projects.find((item) => item.id === projectId);
        if (project) {
            onEditProjectSelect(project);
        }
    };

    const handleAddClick = () => {
        onAddProject();
    };

    return {
        searchQuery,
        sortOption,
        visibleProjects,
        updateQueryParams,
        handleDeleteProject,
        handleEditProject,
        handleAddClick,
    };
}

function parseSortOption(value: string | null): ProjectSortOption {
    if (value === 'name' || value === 'contractAmount' || value === 'startDate' || value === 'endDate' || value === 'progress') {
        return value;
    }

    return DEFAULT_SORT;
}

export function createQueryParams(baseParams: string, updates: Record<string, string>) {
    const nextParams = new URLSearchParams(baseParams);

    Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
            nextParams.delete(key);
            return;
        }

        nextParams.set(key, value);
    });

    return nextParams.toString();
}

export function getSortOption(value: string | null): ProjectSortOption {
    return parseSortOption(value);
}
