import Link from 'next/link';
import { Building2, CalendarRange, CircleDollarSign, MapPin } from 'lucide-react';
import { getProjectStatusLabel } from '@/entities/project/model/status';
import { ProjectStatusDot } from '@/entities/project/ui/ProjectStatusDot';
import { Badge, Progress } from '@repo/ui';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@repo/ui';
import { Separator } from '@repo/ui';
import { ProjectListItem } from '../../shared/types';
import { ProjectActions } from './project-actions';
import { formatProjectCurrency, formatProjectDate } from '../utils/formatters';
import { getProgressGradient } from '../utils/progress-gradient';

type ProjectCardProps = {
    project: ProjectListItem;
    onDelete: (projectId: string) => void;
    onEdit: (projectId: string) => void;
};

export function ProjectCard({ project, onDelete, onEdit }: ProjectCardProps) {
    const statusLabel = getProjectStatusLabel(project.status);
    const customerLabel = project.customerName?.trim() || 'Заказчик не указан';
    const addressLabel = project.objectAddress?.trim() || 'Адрес объекта не указан';
    const timelineLabel = project.startDate || project.endDate
        ? `${formatProjectDate(project.startDate)} — ${formatProjectDate(project.endDate)}`
        : 'Сроки не указаны';

    return (
        <Card className="group h-full gap-0 overflow-hidden border-border/80 py-0 shadow-none transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-sm">
            <CardHeader className="flex flex-col gap-3 p-4 pb-0">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="pt-1">
                        <ProjectStatusDot status={project.status} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{statusLabel}</Badge>
                            <Badge variant="secondary">{project.progress}%</Badge>
                        </div>
                        <CardTitle className="mt-2 text-base leading-tight">
                            <Link
                                href={`/app/projects/${project.slug}`}
                                className="line-clamp-2 transition-colors hover:text-foreground/80 hover:underline"
                            >
                                {project.name}
                            </Link>
                        </CardTitle>
                    </div>
                </div>
                <CardDescription className="flex min-w-0 flex-col gap-2 text-xs">
                    <div className="flex min-w-0 items-start gap-2">
                        <Building2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{customerLabel}</span>
                    </div>
                    <div className="flex min-w-0 items-start gap-2">
                        <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                        <span className="line-clamp-2">{addressLabel}</span>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 p-4">
                <div className="grid gap-2">
                    <div className="flex flex-col gap-1 rounded-lg border bg-muted/30 px-3 py-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CircleDollarSign className="size-3.5" aria-hidden="true" />
                            <span>Бюджет</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                            {formatProjectCurrency(project.contractAmount)}
                        </p>
                    </div>
                    <div className="flex flex-col gap-1 rounded-lg border bg-muted/30 px-3 py-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CalendarRange className="size-3.5" aria-hidden="true" />
                            <span>Сроки</span>
                        </div>
                        <p className="line-clamp-2 text-sm font-medium text-foreground">
                            {timelineLabel}
                        </p>
                    </div>
                </div>
                <Separator />
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-muted-foreground">Прогресс проекта</p>
                        <span className="text-sm font-semibold text-foreground">{project.progress}%</span>
                    </div>
                    <Progress
                        value={project.progress}
                        aria-label={`Progress for ${project.name}`}
                        className="h-2 bg-muted/70"
                        indicatorStyle={{ backgroundImage: getProgressGradient(project.progress) }}
                    />
                </div>
            </CardContent>
            <CardFooter className="mt-auto border-t px-4 pt-4 pb-4">
                <ProjectActions
                    projectId={project.id}
                    projectSlug={project.slug}
                    projectName={project.name}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    density="compact"
                />
            </CardFooter>
        </Card>
    );
}
