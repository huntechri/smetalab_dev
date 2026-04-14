import { AlertTriangle } from 'lucide-react';
import { StateShell } from './StateShell';

interface ErrorStateProps {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function ErrorState({
    title = 'Произошла ошибка',
    description = 'Попробуйте обновить страницу или повторить действие позже.',
    action,
    className,
}: ErrorStateProps) {
    return (
        <StateShell
            title={title}
            description={description}
            action={action}
            icon={<AlertTriangle className="h-5 w-5" />}
            className={className}
        />
    );
}
