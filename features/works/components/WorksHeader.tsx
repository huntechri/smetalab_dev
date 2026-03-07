import { Loader2 } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';

interface WorksHeaderProps {
    isLoading: boolean;
    totalCount: number;
}

export function WorksHeader({ isLoading, totalCount }: WorksHeaderProps) {
    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
                <h1 className="sr-only">Работы</h1>
                <Badge variant="secondary" className="font-medium">{totalCount.toLocaleString('ru-RU')} записей</Badge>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
        </div>
    );
}
