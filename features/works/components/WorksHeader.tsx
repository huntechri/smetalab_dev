import { Loader2 } from 'lucide-react';

interface WorksHeaderProps {
    isLoading: boolean;
}

export function WorksHeader({ isLoading }: WorksHeaderProps) {
    return (
        <div className="flex items-center gap-3">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
    );
}
