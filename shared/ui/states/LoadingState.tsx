import { StateShell } from './StateShell';
import { LoadingIndicator } from '../loading-indicator';

interface LoadingStateProps {
    title?: string;
    description?: string;
    className?: string;
}

export function LoadingState({
    title = 'Загрузка данных',
    description = 'Пожалуйста, подождите...',
    className,
}: LoadingStateProps) {
    return (
        <StateShell
            title={title}
            description={description}
            icon={<LoadingIndicator variant="inline" size="sm" showLabel={false} />}
            className={className}
        />
    );
}
