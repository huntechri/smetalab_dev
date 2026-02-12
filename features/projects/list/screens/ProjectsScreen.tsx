'use client';

import { useEffect, useState } from 'react';
import { ProjectListItem } from '../../shared/types';
import { ProjectsKpiPlaceholders } from '../components/projects-kpi-placeholders';
import { ProjectsToolbar } from '../components/projects-toolbar';
import { ProjectsList } from '../components/projects-list';
import { CreateProjectDialog } from '../components/create-project-dialog';
import { useProjectsScreen } from '../hooks/use-projects-screen';

type ProjectsScreenProps = {
    initialProjects: ProjectListItem[];
    counterparties: { id: string; name: string }[];
};

export function ProjectsScreen({ initialProjects, counterparties }: ProjectsScreenProps) {
    const [projects, setProjects] = useState<ProjectListItem[]>(initialProjects);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<ProjectListItem | undefined>();

    useEffect(() => {
        setProjects(initialProjects);
    }, [initialProjects]);

    const {
        searchQuery,
        sortOption,
        viewMode,
        visibleProjects,
        updateQueryParams,
        handleDeleteProject,
        handleEditProject,
        handleAddClick,
    } = useProjectsScreen({
        projects,
        onEditProjectSelect: (project) => {
            setEditingProject(project);
            setDialogOpen(true);
        },
        onAddProject: () => {
            setEditingProject(undefined);
            setDialogOpen(true);
        },
    });

    const onDelete = async (projectId: string) => {
        const isDeleted = await handleDeleteProject(projectId);
        if (isDeleted) {
            setProjects((previousProjects) => previousProjects.filter((project) => project.id !== projectId));
        }
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
                onDelete={onDelete}
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
