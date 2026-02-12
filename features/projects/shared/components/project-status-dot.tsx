import { ProjectStatus } from '../types';
import { cn } from '@/lib/utils';

type ProjectStatusDotProps = {
    status: ProjectStatus;
};

const STATUS_STYLES: Record<ProjectStatus, { dot: string; pulse: string }> = {
    active: {
        dot: 'bg-emerald-500',
        pulse: 'animate-ping bg-emerald-500/60',
    },
    completed: {
        dot: 'bg-muted-foreground',
        pulse: 'bg-muted-foreground/40',
    },
    planned: {
        dot: 'bg-blue-500',
        pulse: 'animate-pulse bg-blue-500/50',
    },
    paused: {
        dot: 'bg-amber-500',
        pulse: 'bg-amber-500/40',
    },
};

export function ProjectStatusDot({ status }: ProjectStatusDotProps) {
    const style = STATUS_STYLES[status];

    return (
        <span className="relative inline-flex size-2.5" aria-hidden="true">
            <span className={cn('absolute inline-flex h-full w-full rounded-full', style.pulse)} />
            <span className={cn('relative inline-flex size-2.5 rounded-full', style.dot)} />
        </span>
    );
}
