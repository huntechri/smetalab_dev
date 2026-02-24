import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EstimateMeta } from '../types/dto';

const statusMap: Record<EstimateMeta['status'], string> = {
    draft: 'Подготовка',
    in_progress: 'В процессе',
    approved: 'Выполнено',
};

export function EstimateHeader({ meta }: { meta: EstimateMeta }) {
    return (
        <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardContent className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight">{meta.name}</h1>
                    <p className="text-xs md:text-sm text-muted-foreground">
                        Обновлено: {new Date(meta.updatedAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                    <Badge variant="secondary" className="font-medium">{statusMap[meta.status]}</Badge>
                    <div className="h-8 w-[1px] bg-border/40 hidden sm:block mx-1" />
                    <div className="flex flex-col sm:items-end">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold leading-none mb-1">Итого</span>
                        <span className="text-lg md:text-xl font-bold text-primary">
                            {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(meta.total)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
