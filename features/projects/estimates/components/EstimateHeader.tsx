import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EstimateMeta } from '../types/dto';

const statusMap: Record<EstimateMeta['status'], string> = {
    draft: 'Черновик',
    in_progress: 'В работе',
    approved: 'Согласована',
};

export function EstimateHeader({ meta }: { meta: EstimateMeta }) {
    return (
        <Card>
            <CardContent className="py-5 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold">{meta.name}</h1>
                    <p className="text-sm text-muted-foreground">Обновлено: {new Date(meta.updatedAt).toLocaleString('ru-RU')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline">{statusMap[meta.status]}</Badge>
                    <Badge>Итого: {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(meta.total)}</Badge>
                </div>
            </CardContent>
        </Card>
    );
}
