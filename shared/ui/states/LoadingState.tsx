import { Loader2 } from 'lucide-react';
import { StateShell } from './StateShell';

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
            icon={<Loader2 className="h-5 w-5 animate-spin" />}
            className={className}
        />
    );
}
