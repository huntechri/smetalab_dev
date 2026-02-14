import { ProjectListItem } from '../../shared/types';
import { ProjectActions } from './project-actions';
import { formatProjectCurrency, formatProjectDate } from '../utils/formatters';
import { ProjectStatusDot } from '../../shared/components/project-status-dot';

type ProjectRowProps = {
    project: ProjectListItem;
    onDelete: (projectId: string) => void;
    onEdit: (projectId: string) => void;
};

export function ProjectRow({ project, onDelete, onEdit }: ProjectRowProps) {
    return (
        <div className="rounded-md border px-3 py-2">
            <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
                <div className="grid min-w-0 flex-1 gap-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,auto)_minmax(0,auto)] lg:items-center lg:gap-3">
                    <div className="min-w-0 space-y-0.5">
                        <div className="flex min-w-0 items-center gap-2">
                            <ProjectStatusDot status={project.status} />
                            <p className="truncate text-sm font-semibold">{project.name}</p>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{project.customerName}</p>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{formatProjectCurrency(project.contractAmount)}</p>
                    <p className="truncate text-xs text-muted-foreground">{`${formatProjectDate(project.startDate)} — ${formatProjectDate(project.endDate)}`}</p>
                    <div
                        role="progressbar"
                        aria-valuenow={project.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Progress for ${project.name}`}
                        className="h-1 w-24 overflow-hidden rounded-full bg-muted"
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
                    density="compact"
                />
            </div>
        </div>
    );
}
