import { Loader2 } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';

interface MaterialsHeaderProps {
    isLoading: boolean;
    totalCount: number;
}

export function MaterialsHeader({ isLoading, totalCount }: MaterialsHeaderProps) {
    return (
        <div className="flex items-center gap-3">
            <Badge variant="secondary" className="h-7 px-3 text-xs font-semibold shadow-sm">
                {totalCount.toLocaleString('ru-RU')} записей
            </Badge>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
    );
}
