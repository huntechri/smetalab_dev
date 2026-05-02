import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { StatusBadge, StatusIndicator, type StatusTone } from '@/shared/ui/status-badge';
import { Clock } from 'lucide-react';

const focusItems = [
    { label: 'Закрытие актов «Северный»', meta: 'До 14:00', status: 'Согласование', tone: 'success' },
    { label: 'Поставка арматуры', meta: 'До 16:30', status: 'Снабжение', tone: 'info' },
    { label: 'Контроль качества (фасад)', meta: 'До 18:00', status: 'Технадзор', tone: 'paused' },
] satisfies ReadonlyArray<{
    label: string;
    meta: string;
    status: string;
    tone: StatusTone;
}>;

export function TodayFocusSection() {
    return (
        <section aria-labelledby="today-title" className="space-y-4 lg:col-span-3">
            <div className="flex items-center justify-between">
                <h2 id="today-title" className="text-lg font-semibold tracking-tight">Фокус на сегодня</h2>
                <Badge size="xs">Смена #42</Badge>
            </div>

            <Card className="glass-card overflow-hidden border-border/40 bg-background/50 shadow-sm backdrop-blur-md">
                <CardContent className="p-0">
                    <div className="h-[200px] divide-y divide-border/20 overflow-y-auto">
                        {focusItems.map((item) => (
                            <div key={item.label} className="group flex cursor-pointer items-center justify-between gap-4 p-4 transition-all hover:bg-muted/20">
                                <div className="flex items-start gap-3">
                                    <StatusIndicator tone="brand" size="sm" pulse="pulse" className="mt-1.5 transition-transform duration-300 group-hover:scale-125" />
                                    <div>
                                        <p className="text-sm font-semibold leading-none text-foreground transition-colors group-hover:text-primary">{item.label}</p>
                                        <div className="mt-2 flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                                            <span className="text-xs text-muted-foreground">{item.meta}</span>
                                        </div>
                                    </div>
                                </div>
                                <StatusBadge tone={item.tone}>
                                    {item.status}
                                </StatusBadge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
