import { Card, CardContent } from '@/shared/ui/card';
import { ProjectListItem } from '../../shared/types';
import { ProjectStatusDot } from '@/entities/project/ui/ProjectStatusDot';
import { ProjectActions } from './project-actions';
import { formatProjectCurrency, formatProjectDate } from '../utils/formatters';
import { getProgressGradient } from '../utils/progress-gradient';

type ProjectCardProps = {
    project: ProjectListItem;
    onDelete: (projectId: string) => void;
    onEdit: (projectId: string) => void;
};

export function ProjectCard({ project, onDelete, onEdit }: ProjectCardProps) {
    return (
        <Card className="flex flex-col h-full py-0 border-border rounded-[7.6px] bg-white shadow-none transition-colors duration-200 group hover:border-border/60">
            <CardContent className="flex flex-col flex-1 min-w-0 p-3 sm:p-4 gap-2.5">
                <div className="flex min-w-0 items-start gap-2">
                    <ProjectStatusDot status={project.status} />
                    <h3 className="truncate text-sm font-semibold">{project.name}</h3>
                </div>
                <div className="flex-1 min-w-0 space-y-1 text-xs text-muted-foreground">
                    <p className="truncate">{project.customerName || '\u00A0'}</p>
                    <p className="truncate">{formatProjectCurrency(project.contractAmount)}</p>
                    <p className="truncate">
                        {project.startDate || project.endDate
                            ? `${formatProjectDate(project.startDate)} — ${formatProjectDate(project.endDate)}`
                            : 'Сроки не указаны'}
                    </p>
                </div>
                <div className="space-y-1 mt-auto">
                    <p className="text-[11px] text-muted-foreground">Прогресс: {project.progress}%</p>
                    <div
                        role="progressbar"
                        aria-valuenow={project.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Progress for ${project.name}`}
                        className="h-2 w-full overflow-hidden rounded-[7.6px] bg-muted/60"
                    >
                        <div
                            className="h-full"
                            style={{ width: `${project.progress}%`, backgroundImage: getProgressGradient(project.progress) }}
                        />
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
