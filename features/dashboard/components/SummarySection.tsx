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

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {summaryItems.map((item, idx) => (
                    <Card
                        key={item.title}
                        className={cn('glass-card border-border/40 bg-background/50 backdrop-blur-md shadow-sm hover:shadow hover:border-border/80 transition-all duration-300', 'flex flex-col justify-between p-5')}
                        style={{ '--idx': idx } as CSSProperties}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.title}</p>
                            <div className={cn('rounded-lg p-2 transition-colors', item.bg, item.color)}>
                                <item.icon className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-baseline gap-2">
                                <CardTitle className="text-3xl font-bold tracking-tight">{item.value}</CardTitle>
                            </div>
                            <p className="text-xs font-medium text-muted-foreground/80">{item.note}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
