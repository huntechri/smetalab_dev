import type { StateShellDensity, StateShellVariant } from './StateShell';
import { StateShell } from './StateShell';
import { LoadingIndicator } from '../loading-indicator';

interface LoadingStateProps {
    title?: string;
    description?: string | null;
    className?: string;
    variant?: StateShellVariant;
    density?: StateShellDensity;
}

export function LoadingState({
    title = 'Загрузка данных',
    description = 'Пожалуйста, подождите...',
    className,
    variant = 'plain',
    density = 'default',
}: LoadingStateProps) {
    return (
        <StateShell
            title={title}
            description={description}
            icon={<LoadingIndicator variant="inline" size="sm" showLabel={false} />}
            className={className}
            variant={variant}
            density={density}
        />
    );
}
