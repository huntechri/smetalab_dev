'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ProjectListItem, ProjectSortOption, ProjectViewMode } from '../types';
import { filterProjects } from '../utils/filter';
import { sortProjects } from '../utils/sort';
import { ProjectsKpiPlaceholders } from '../components/projects-kpi-placeholders';
import { ProjectsToolbar } from '../components/projects-toolbar';
import { ProjectsList } from '../components/projects-list';

type ProjectsScreenProps = {
    initialProjects: ProjectListItem[];
};

const DEFAULT_SORT: ProjectSortOption = 'name';
const DEFAULT_VIEW: ProjectViewMode = 'grid';

export function ProjectsScreen({ initialProjects }: ProjectsScreenProps) {
    const [projects, setProjects] = useState<ProjectListItem[]>(initialProjects);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const searchQuery = searchParams.get('q') ?? '';
    const sortOption = parseSortOption(searchParams.get('sort'));
    const viewMode = parseViewMode(searchParams.get('view'));

    const visibleProjects = useMemo(() => {
        return sortProjects(filterProjects(projects, searchQuery), sortOption);
    }, [projects, searchQuery, sortOption]);

    const updateQueryParams = (updates: Record<string, string>) => {
        const nextParams = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (!value) {
                nextParams.delete(key);
                return;
            }

            nextParams.set(key, value);
        });

        const queryString = nextParams.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    };

    const handleDeleteProject = (projectId: string) => {
        setProjects((previousProjects) => previousProjects.filter((project) => project.id !== projectId));
    };

    return (
        <div className="space-y-4">
            <ProjectsKpiPlaceholders />
            <ProjectsToolbar
                searchQuery={searchQuery}
                sortOption={sortOption}
                viewMode={viewMode}
                onSearchQueryChange={(value) => updateQueryParams({ q: value })}
                onSortOptionChange={(value) => updateQueryParams({ sort: value })}
                onViewModeChange={(value) => updateQueryParams({ view: value })}
            />
            <ProjectsList projects={visibleProjects} viewMode={viewMode} onDelete={handleDeleteProject} />
        </div>
    );
}

function parseSortOption(value: string | null): ProjectSortOption {
    if (value === 'name' || value === 'contractAmount' || value === 'startDate' || value === 'endDate' || value === 'progress') {
        return value;
    }

    return DEFAULT_SORT;
}

function parseViewMode(value: string | null): ProjectViewMode {
    if (value === 'grid' || value === 'list') {
        return value;
    }

    return DEFAULT_VIEW;
}
