import { AlertTriangle } from 'lucide-react';
import type { StateShellDensity, StateShellVariant } from './StateShell';
import { StateShell } from './StateShell';

interface ErrorStateProps {
    title?: string;
    description?: string | null;
    action?: React.ReactNode;
    className?: string;
    variant?: StateShellVariant;
    density?: StateShellDensity;
}

export function ErrorState({
    title = 'Произошла ошибка',
    description = 'Попробуйте обновить страницу или повторить действие позже.',
    action,
    className,
    variant = 'plain',
    density = 'default',
}: ErrorStateProps) {
    return (
        <StateShell
            title={title}
            description={description}
            action={action}
            icon={<AlertTriangle className="h-5 w-5" />}
            className={className}
            variant={variant}
            density={density}
        />
    );
}
