import { Card, CardContent } from '@/components/ui/card';
import { ProjectListItem } from '../../shared/types';
import { ProjectStatusDot } from '../../shared/components/project-status-dot';
import { ProjectActions } from './project-actions';
import { formatProjectCurrency, formatProjectDate } from '../utils/formatters';

type ProjectCardProps = {
    project: ProjectListItem;
    onDelete: (projectId: string) => void;
    onEdit: (projectId: string) => void;
};

export function ProjectCard({ project, onDelete, onEdit }: ProjectCardProps) {
    return (
        <Card className="py-0">
            <CardContent className="min-w-0 space-y-3 p-4">
                <div className="flex min-w-0 items-start gap-2">
                    <ProjectStatusDot status={project.status} />
                    <h3 className="truncate text-sm font-semibold">{project.name}</h3>
                </div>
                <div className="min-w-0 space-y-1 text-xs text-muted-foreground">
                    <p className="truncate">{project.customerName}</p>
                    <p className="truncate">{formatProjectCurrency(project.contractAmount)}</p>
                    {(project.startDate || project.endDate) && (
                        <p className="truncate">
                            {`${formatProjectDate(project.startDate)} — ${formatProjectDate(project.endDate)}`}
                        </p>
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground">Прогресс: {project.progress}%</p>
                    <div
                    role="progressbar"
                    aria-valuenow={project.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progress for ${project.name}`}
                    className="h-2 w-full overflow-hidden rounded-full bg-muted"
>
                        <div className="h-full bg-primary" style={{ width: `${project.progress}%` }} />
                    </div>
                </div>
                <ProjectActions
                    projectId={project.id}
                    projectSlug={project.slug}
                    projectName={project.name}
                    onDelete={onDelete}
                    onEdit={onEdit}
                />
            </CardContent>
        </Card>
    );
}
