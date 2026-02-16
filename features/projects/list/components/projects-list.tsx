import { FolderPlus, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { ProjectListItem, ProjectViewMode } from '../../shared/types';
import { ProjectCard } from './project-card';
import { ProjectRow } from './project-row';

type ProjectsListProps = {
    projects: ProjectListItem[];
    totalProjectsCount: number;
    viewMode: ProjectViewMode;
    onCreate?: () => void;
    onDelete: (projectId: string) => void;
    onEdit: (projectId: string) => void;
};

export function ProjectsList({
    projects,
    totalProjectsCount,
    viewMode,
    onCreate,
    onDelete,
    onEdit,
}: ProjectsListProps) {
    if (totalProjectsCount === 0) {
        return (
            <Empty>
                <EmptyMedia variant="icon">
                    <FolderPlus className="size-6" />
                </EmptyMedia>
                <EmptyHeader>
                    <EmptyTitle>Нет проектов</EmptyTitle>
                    <EmptyDescription>
                        Создайте свой первый проект, чтобы начать работу.
                    </EmptyDescription>
                </EmptyHeader>
                {onCreate && (
                    <EmptyContent>
                        <Button onClick={onCreate}>Создать проект</Button>
                    </EmptyContent>
                )}
            </Empty>
        );
    }

    if (projects.length === 0) {
        return (
            <Empty>
                <EmptyMedia variant="icon">
                    <SearchX className="size-6" />
                </EmptyMedia>
                <EmptyHeader>
                    <EmptyTitle>Ничего не найдено</EmptyTitle>
                    <EmptyDescription>
                        Попробуйте изменить параметры поиска.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    if (viewMode === 'list') {
        return (
            <div className="flex flex-col gap-2">
                {projects.map((project) => (
                    <ProjectRow
                        key={project.id}
                        project={project}
                        onDelete={onDelete}
                        onEdit={onEdit}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {projects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    onDelete={onDelete}
                    onEdit={onEdit}
                />
            ))}
        </div>
    );
}
