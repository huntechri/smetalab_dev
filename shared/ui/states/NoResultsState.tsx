import { FolderOpen } from 'lucide-react';
import type { StateShellDensity, StateShellVariant } from './StateShell';
import { StateShell } from './StateShell';

interface NoResultsStateProps {
    title?: string;
    description?: string | null;
    action?: React.ReactNode;
    className?: string;
    variant?: StateShellVariant;
    density?: StateShellDensity;
}

export function NoResultsState({
    title = 'Ничего не найдено',
    description,
    action,
    className,
    variant = 'surface',
    density = 'compact',
}: NoResultsStateProps) {
    return (
        <StateShell
            title={title}
            description={description}
            action={action}
            icon={<FolderOpen className="h-5 w-5 opacity-40" />}
            className={className}
            variant={variant}
            density={density}
        />
    );
}
