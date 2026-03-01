import { ShieldAlert } from 'lucide-react';
import { StateShell } from './StateShell';

interface ForbiddenStateProps {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function ForbiddenState({
    title = 'Доступ ограничен',
    description = 'У вас нет доступа к этому разделу.',
    action,
    className,
}: ForbiddenStateProps) {
    return (
        <StateShell
            title={title}
            description={description}
            action={action}
            icon={<ShieldAlert className="h-5 w-5" />}
            className={className}
        />
    );
}
