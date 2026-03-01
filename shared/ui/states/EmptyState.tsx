import { Inbox } from 'lucide-react';
import { StateShell } from './StateShell';

interface EmptyStateProps {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    title = 'Нет данных для отображения',
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <StateShell
            title={title}
            description={description}
            action={action}
            icon={<Inbox className="h-5 w-5" />}
            className={className}
        />
    );
}
