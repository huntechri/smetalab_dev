import { FolderKanban } from 'lucide-react';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/shared/ui/empty';
import { ProjectListItem } from '../../shared/types';
import { ProjectCard } from './project-card';

type ProjectsListProps = {
    projects: ProjectListItem[];
    onDelete: (projectId: string) => void;
    onEdit: (projectId: string) => void;
};

export function ProjectsList({ projects, onDelete, onEdit }: ProjectsListProps) {
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

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {projects.map((project) => (
                <ProjectCard key={project.id} project={project} onDelete={onDelete} onEdit={onEdit} />
            ))}
        </div>
    );
}
