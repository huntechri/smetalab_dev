import { Inbox } from 'lucide-react';
import { TableEmptyState, TableEmptyStateProps } from '../table-empty-state';

interface EmptyStateProps extends Omit<TableEmptyStateProps, 'icon' | 'title'> {
    title?: string;
    icon?: TableEmptyStateProps['icon'];
}

export function EmptyState({
    title = 'Нет данных для отображения',
    icon = Inbox,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <TableEmptyState
            title={title}
            description={description}
            action={action}
            icon={icon}
            className={className}
        />
    );
}
