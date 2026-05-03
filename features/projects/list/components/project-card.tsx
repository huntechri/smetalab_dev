import Link from 'next/link';
import { Building2, CalendarRange, CircleDollarSign, MapPin } from 'lucide-react';
import { ProjectStatusBadge } from '@/entities/project/ui/ProjectStatusBadge';
import { ProjectStatusDot } from '@/entities/project/ui/ProjectStatusDot';
import { Badge } from '@/shared/ui/badge';
import {
    CardShell,
    CardShellBody,
    CardShellFooter,
    CardShellHeader,
    CardShellInset,
} from '@/shared/ui/card-shell';
import { Progress } from '@/shared/ui/progress';
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
    const customerLabel = project.customerName?.trim() || 'Заказчик не указан';
    const addressLabel = project.objectAddress?.trim() || 'Адрес объекта не указан';
    const timelineLabel = project.startDate || project.endDate
        ? `${formatProjectDate(project.startDate)} — ${formatProjectDate(project.endDate)}`
        : 'Сроки не указаны';

    return (
        <CardShell
            className="group h-full gap-0 border-border/80"
            density="compact"
            interactive
            shadow="none"
        >
            <CardShellHeader className="flex flex-col gap-2.5 pb-0 sm:pb-0" density="compact">
                <div className="flex min-w-0 items-start gap-2.5">
                    <div className="pt-1">
                        <ProjectStatusDot status={project.status} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <ProjectStatusBadge status={project.status} />
                            <Badge variant="secondary" size="xs">{project.progress}%</Badge>
                        </div>
                        <h3 className="mt-1.5 text-base font-semibold leading-tight">
                            <Link
                                href={`/app/projects/${project.slug}`}
                                className="line-clamp-2 transition-colors hover:text-foreground/80 hover:underline"
                            >
                                {project.name}
                            </Link>
                        </h3>
                    </div>
                </div>
                <div className="flex min-w-0 flex-col gap-1.5 text-xs text-muted-foreground">
                    <div className="flex min-w-0 items-start gap-2">
                        <Building2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{customerLabel}</span>
                    </div>
                    <div className="flex min-w-0 items-start gap-2">
                        <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                        <span className="line-clamp-1 sm:line-clamp-2">{addressLabel}</span>
                    </div>
                </div>
            </CardShellHeader>
            <CardShellBody className="flex flex-1 flex-col gap-3" density="compact">
                <div className="grid gap-2 sm:grid-cols-2">
                    <CardShellInset className="flex min-w-0 flex-col gap-1" density="compact" variant="muted">
                        <div className="flex items-center gap-2 text-[0.6875rem] font-medium text-muted-foreground">
                            <CircleDollarSign className="size-3.5" aria-hidden="true" />
                            <span>Бюджет</span>
                        </div>
                        <p className="truncate text-sm font-semibold text-foreground">
                            {formatProjectCurrency(project.contractAmount)}
                        </p>
                    </CardShellInset>
                    <CardShellInset className="flex min-w-0 flex-col gap-1" density="compact" variant="muted">
                        <div className="flex items-center gap-2 text-[0.6875rem] font-medium text-muted-foreground">
                            <CalendarRange className="size-3.5" aria-hidden="true" />
                            <span>Сроки</span>
                        </div>
                        <p className="line-clamp-2 text-sm font-medium text-foreground">
                            {timelineLabel}
                        </p>
                    </CardShellInset>
                </div>
                <CardShellInset className="mt-auto py-2.5" density="compact" variant="subtle">
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                        <p className="text-xs font-medium text-muted-foreground">Прогресс проекта</p>
                        <span className="text-sm font-semibold text-foreground">{project.progress}%</span>
                    </div>
                    <Progress
                        value={project.progress}
                        aria-label={`Progress for ${project.name}`}
                        className="h-1.5 bg-muted/70"
                        indicatorStyle={{ backgroundImage: getProgressGradient(project.progress) }}
                    />
                </CardShellInset>
            </CardShellBody>
            <CardShellFooter className="mt-auto" density="compact" divided>
                <ProjectActions
                    projectId={project.id}
                    projectSlug={project.slug}
                    projectName={project.name}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    density="compact"
                />
            </CardShellFooter>
        </CardShell>
    );
}
