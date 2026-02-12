'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ProjectListItem, ProjectSortOption, ProjectViewMode } from '../../shared/types';
import { filterProjects } from '../../shared/utils/filter';
import { sortProjects } from '../../shared/utils/sort';
import { ProjectsKpiPlaceholders } from '../components/projects-kpi-placeholders';
import { ProjectsToolbar } from '../components/projects-toolbar';
import { ProjectsList } from '../components/projects-list';
import { CreateProjectDialog } from '../components/create-project-dialog';
import { deleteProjectAction } from '@/app/actions/projects/delete';
import { toast } from 'sonner';

type ProjectsScreenProps = {
    initialProjects: ProjectListItem[];
    counterparties: { id: string; name: string }[];
};

const DEFAULT_SORT: ProjectSortOption = 'name';
const DEFAULT_VIEW: ProjectViewMode = 'grid';

export function ProjectsScreen({ initialProjects, counterparties }: ProjectsScreenProps) {
    const [projects, setProjects] = useState<ProjectListItem[]>(initialProjects);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<ProjectListItem | undefined>();

    // Sync state when initialProjects (from server) change
    useEffect(() => {
        setProjects(initialProjects);
    }, [initialProjects]);

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

    const handleDeleteProject = async (projectId: string) => {
        try {
            const result = await deleteProjectAction(projectId);
            if (result.success) {
                setProjects((previousProjects) => previousProjects.filter((project) => project.id !== projectId));
                toast.success('Проект успешно удален');
            } else {
                toast.error(result.error || 'Не удалось удалить проект');
            }
        } catch {
            toast.error('Произошла непредвиденная ошибка');
        }
    };

    const handleEditProject = (projectId: string) => {
        const project = projects.find((p) => p.id === projectId);
        if (project) {
            setEditingProject(project);
            setDialogOpen(true);
        }
    };

    const handleAddClick = () => {
        setEditingProject(undefined);
        setDialogOpen(true);
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
                onAddClick={handleAddClick}
            />
            <ProjectsList
                projects={visibleProjects}
                viewMode={viewMode}
                onDelete={handleDeleteProject}
                onEdit={handleEditProject}
            />
            <CreateProjectDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                counterparties={counterparties}
                project={editingProject}
            />
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
