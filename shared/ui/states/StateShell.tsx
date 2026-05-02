import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type StateShellVariant = 'plain' | 'surface';
export type StateShellDensity = 'default' | 'compact';

export interface StateShellProps {
    title: string;
    description?: string | null;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
    variant?: StateShellVariant;
    density?: StateShellDensity;
}

const stateShellContainerClassName: Record<StateShellVariant, string> = {
    plain: 'flex h-full items-center justify-center',
    surface: 'm-4 flex min-h-40 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20',
};

const stateShellDensityClassName: Record<StateShellDensity, string> = {
    default: 'p-8',
    compact: 'p-6',
};

const stateShellContentClassName: Record<StateShellDensity, string> = {
    default: 'max-w-md space-y-3',
    compact: 'max-w-sm space-y-2',
};

const stateShellIconClassName: Record<StateShellDensity, string> = {
    default: 'h-10 w-10',
    compact: 'h-9 w-9',
};

const stateShellTitleClassName: Record<StateShellDensity, string> = {
    default: 'text-lg font-semibold',
    compact: 'text-sm font-medium',
};

export function StateShell({
    title,
    description,
    icon,
    action,
    className,
    variant = 'plain',
    density = 'default',
}: StateShellProps) {
    return (
        <div
            className={cn(
                stateShellContainerClassName[variant],
                stateShellDensityClassName[density],
                className,
            )}
        >
            <div className={cn('text-center', stateShellContentClassName[density])}>
                {icon ? (
                    <div
                        className={cn(
                            'mx-auto flex items-center justify-center rounded-full bg-muted text-muted-foreground',
                            stateShellIconClassName[density],
                        )}
                        aria-hidden="true"
                    >
                        {icon}
                    </div>
                ) : null}
                <h2 className={stateShellTitleClassName[density]}>{title}</h2>
                {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
                {action ? <div className="pt-1">{action}</div> : null}
            </div>
        </div>
    );
}
