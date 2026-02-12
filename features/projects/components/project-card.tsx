import { Card, CardContent } from '@/components/ui/card';
import { ProjectListItem } from '../types';
import { ProjectStatusDot } from './project-status-dot';
import { ProjectActions } from './project-actions';

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
                    <p className="truncate">{formatCurrency(project.contractAmount)}</p>
                    <p className="truncate">{`${formatDate(project.startDate)} — ${formatDate(project.endDate)}`}</p>
                </div>
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
                <ProjectActions
                    projectId={project.id}
                    projectName={project.name}
                    onDelete={onDelete}
                    onEdit={onEdit}
                />
            </CardContent>
        </Card>
    );
}
