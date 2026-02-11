import { Card, CardContent } from '@/components/ui/card';
import { ProjectListItem } from '../types';
import { ProjectActions } from './project-actions';
import { ProjectStatusDot } from './project-status-dot';

type ProjectRowProps = {
    project: ProjectListItem;
    onDelete: (projectId: string) => void;
};

export function ProjectRow({ project, onDelete }: ProjectRowProps) {
    return (
        <Card className="py-0">
            <CardContent className="min-w-0 space-y-3 p-4">
                <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex min-w-0 items-center gap-2">
                            <ProjectStatusDot status={project.status} />
                            <p className="truncate text-sm font-semibold">{project.name}</p>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{project.customerName}</p>
                    </div>
                    <ProjectActions
                        projectId={project.id}
                        projectName={project.name}
                        onDelete={onDelete}
                        density="compact"
                    />
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-[minmax(0,1fr)_minmax(0,auto)] sm:items-center sm:gap-4">
                    <p className="truncate">{formatCurrency(project.contractAmount)}</p>
                    <p className="truncate sm:text-right">{`${formatDate(project.startDate)} — ${formatDate(project.endDate)}`}</p>
                </div>
                <div
                    role="progressbar"
                    aria-valuenow={project.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progress for ${project.name}`}
                    className="hidden h-1.5 w-full overflow-hidden rounded-full bg-muted lg:block"
                >
                    <div className="h-full bg-primary" style={{ width: `${project.progress}%` }} />
                </div>
            </CardContent>
        </Card>
    );
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ru-RU');
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(value);
}
