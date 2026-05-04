import { cn } from '@/lib/utils';
import type { StateShellDensity, StateShellVariant } from './StateShell';
import { StateShell } from './StateShell';
import { LoadingIndicator } from '../loading-indicator';

interface LoadingStateProps {
    title?: string;
    description?: string | null;
    className?: string;
    variant?: StateShellVariant;
    density?: StateShellDensity;
    height?: string;
}

export function LoadingState({
    title = 'Загрузка данных',
    description = 'Пожалуйста, подождите...',
    className,
    variant = 'plain',
    density = 'default',
    height,
}: LoadingStateProps) {
    return (
        <div className={cn(height, className)}>
            <StateShell
                title={title}
                description={description}
                icon={<LoadingIndicator variant="inline" size="sm" showLabel={false} />}
                variant={variant}
                density={density}
            />
        </div>
    );
}
