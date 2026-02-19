import { FolderKanban } from 'lucide-react';
import {
    Empty,
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
    viewMode: ProjectViewMode;
    onDelete: (projectId: string) => void;
    onEdit: (projectId: string) => void;
};

export function ProjectsList({ projects, viewMode, onDelete, onEdit }: ProjectsListProps) {
    if (projects.length === 0) {
        return (
            <Empty className="py-12">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FolderKanban className="size-6 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>Проекты не найдены</EmptyTitle>
                    <EmptyDescription>
                        По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска или фильтры.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    if (viewMode === 'list') {
        return (
            <div className="flex flex-col gap-2">
                {projects.map((project) => (
                    <ProjectRow key={project.id} project={project} onDelete={onDelete} onEdit={onEdit} />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {projects.map((project) => (
                <ProjectCard key={project.id} project={project} onDelete={onDelete} onEdit={onEdit} />
            ))}
        </div>
    );
}
