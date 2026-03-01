import { Badge } from '@/shared/ui/badge';
import { Card, CardTitle } from '@/shared/ui/card';
import { cn } from '@/lib/utils';
import { AlertTriangle, Building2, Clock, TrendingUp, Truck } from 'lucide-react';
import { CSSProperties } from 'react';

const summaryItems = [
    { title: 'Объекты', value: '12', note: '3 пусконаладка', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { title: 'Поставки', value: '8', note: '2 подтверждения', icon: Truck, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { title: 'Бюджет', value: '97%', note: 'Откл. −1.8%', icon: TrendingUp, color: 'text-sky-600', bg: 'bg-sky-500/10' },
    { title: 'Риски', value: '5', note: '1 критический', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-500/10' },
] as const;

export function SummarySection() {
    return (
        <section aria-labelledby="summary-title" className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 id="summary-title" className="text-lg font-semibold tracking-tight">Сводка</h2>
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <Badge variant="secondary" className="bg-muted/40 font-medium text-[10px] text-muted-foreground px-2 py-0">
                    <Clock className="mr-1 h-2.5 w-2.5" />
                    12м назад
                </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryItems.map((item, idx) => (
                    <Card
                        key={item.title}
                        className={cn('glass-card hover:border-primary/20', 'flex flex-col justify-between p-4')}
                        style={{ '--idx': idx } as CSSProperties}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.title}</p>
                            <div className={cn('rounded-md p-1.5', item.bg, item.color)}>
                                <item.icon className="h-3.5 w-3.5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <CardTitle className="text-2xl font-bold tracking-tight">{item.value}</CardTitle>
                            <p className="text-[11px] font-medium text-muted-foreground">{item.note}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
