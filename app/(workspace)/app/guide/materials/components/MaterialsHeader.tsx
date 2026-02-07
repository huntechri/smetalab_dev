import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MaterialsHeaderProps {
    isLoading: boolean;
    totalCount: number;
}

export function MaterialsHeader({ isLoading, totalCount }: MaterialsHeaderProps) {
    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Материалы</h1>
                <Badge variant="outline" className="text-muted-foreground">{totalCount.toLocaleString('ru-RU')} записей</Badge>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <p className="text-sm text-muted-foreground md:text-base">
                Справочник материалов и оборудования. Используйте поиск или AI‑поиск для фильтра.
            </p>
        </div>
    );
}
