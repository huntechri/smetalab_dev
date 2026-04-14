import { Inbox } from 'lucide-react';
import { TableEmptyState } from '../table-empty-state';

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
        <TableEmptyState
            title={title}
            description={description}
            action={action}
            icon={Inbox}
            className={className}
        />
    );
}
