import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

const focusItems = [
    { label: 'Закрытие актов «Северный»', meta: 'До 14:00', status: 'Согласование', color: 'text-emerald-700 bg-emerald-500/10' },
    { label: 'Поставка арматуры', meta: 'До 16:30', status: 'Снабжение', color: 'text-blue-700 bg-blue-500/10' },
    { label: 'Контроль качества (фасад)', meta: 'До 18:00', status: 'Технадзор', color: 'text-purple-700 bg-purple-500/10' },
] as const;

export function TodayFocusSection() {
    return (
        <section aria-labelledby="today-title" className="space-y-4 lg:col-span-3">
            <div className="flex items-center justify-between">
                <h2 id="today-title" className="text-lg font-semibold tracking-tight">Фокус на сегодня</h2>
                <Badge className="h-5 border-primary/20 bg-primary/5 text-[10px] text-primary">Смена #42</Badge>
            </div>

            <Card className="glass-card overflow-hidden">
                <CardContent className="p-0">
                    <div className="h-[180px] divide-y divide-border/10 overflow-y-auto">
                        {focusItems.map((item) => (
                            <div key={item.label} className="group flex items-center justify-between gap-4 p-3.5 transition-all hover:bg-muted/10">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/20 transition-colors group-hover:bg-primary" />
                                    <div>
                                        <p className="text-sm font-semibold leading-none text-foreground">{item.label}</p>
                                        <div className="mt-1.5 flex items-center gap-2">
                                            <Clock className="h-3 w-3 text-muted-foreground/60" />
                                            <span className="text-[11px] text-muted-foreground">{item.meta}</span>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="outline" className={cn('rounded-sm border-0 px-1.5 py-0.5 text-[9px] font-bold uppercase', item.color)}>
                                    {item.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
