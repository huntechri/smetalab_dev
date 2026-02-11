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
            <CardContent className="min-w-0 space-y-3 p-4 lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_200px_260px] lg:items-center lg:gap-3 lg:space-y-0">
                <div className="flex min-w-0 items-center gap-2">
                    <ProjectStatusDot status={project.status} />
                    <p className="truncate text-sm font-semibold">{project.name}</p>
                </div>
                <p className="truncate text-xs text-muted-foreground">{project.customerName}</p>
                <p className="truncate text-xs text-muted-foreground">{formatCurrency(project.contractAmount)}</p>
                <p className="truncate text-xs text-muted-foreground">{`${formatDate(project.startDate)} — ${formatDate(project.endDate)}`}</p>
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
                <ProjectActions projectId={project.id} projectName={project.name} onDelete={onDelete} />
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
