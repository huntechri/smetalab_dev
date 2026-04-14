import { cn } from '@/lib/utils';

interface StateShellProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

export function StateShell({ title, description, icon, action, className }: StateShellProps) {
    return (
        <div className={cn("flex items-center justify-center h-full p-8", className)}>
            <div className="text-center max-w-md space-y-3">
                {icon && (
                    <div className="mx-auto h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground" aria-hidden="true">
                        {icon}
                    </div>
                )}
                <h2 className="text-lg font-semibold">{title}</h2>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
                {action && <div className="pt-1">{action}</div>}
            </div>
        </div>
    );
}
