import { ProjectListItem, ProjectViewMode } from '../types';
import { ProjectCard } from './project-card';
import { ProjectRow } from './project-row';

type ProjectsListProps = {
    projects: ProjectListItem[];
    viewMode: ProjectViewMode;
    onDelete: (projectId: string) => void;
};

export function ProjectsList({ projects, viewMode, onDelete }: ProjectsListProps) {
    if (projects.length === 0) {
        return (
            <p className="rounded-md border p-6 text-sm text-muted-foreground">
                No projects found.
            </p>
        );
    }

    if (viewMode === 'list') {
        return (
            <div className="space-y-3">
                {projects.map((project) => (
                    <ProjectRow key={project.id} project={project} onDelete={onDelete} />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
            {projects.map((project) => (
                <ProjectCard key={project.id} project={project} onDelete={onDelete} />
            ))}
        </div>
    );
}
