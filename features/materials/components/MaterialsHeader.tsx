import { Loader2 } from 'lucide-react';

interface MaterialsHeaderProps {
    isLoading: boolean;
    totalCount: number;
}

export function MaterialsHeader({ isLoading, totalCount }: MaterialsHeaderProps) {
    return (
        <div className="flex items-center gap-3">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
    );
}
