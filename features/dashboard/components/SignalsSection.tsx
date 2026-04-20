import { Card } from '@repo/ui';
import { cn } from '@/lib/utils';
import { Activity, AlertTriangle, Clock } from 'lucide-react';

const signals = [
    { title: 'Задержка бетона (3ч)', note: 'Уведомить подрядчика', icon: AlertTriangle, color: 'text-rose-600 bg-rose-500/5' },
    { title: 'Бюджет «Северный»', note: 'Экономия 1.8%', icon: Activity, color: 'text-emerald-600 bg-emerald-500/5' },
    { title: 'Пересменка «Лесной»', note: 'Обновить график', icon: Clock, color: 'text-sky-600 bg-sky-500/5' },
] as const;

export function SignalsSection() {
    return (
        <section aria-labelledby="signals-title" className="space-y-4">
            <h2 id="signals-title" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <Activity className="h-4 w-4 text-primary" />
                Отклонения
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {signals.map((signal) => (
                    <Card key={signal.title} className="glass-card group cursor-pointer border-border/40 bg-background/50 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-border/80 hover:shadow">
                        <div className="flex items-start gap-4">
                            <div className={cn('shrink-0 rounded-lg p-2 transition-colors', signal.color)}>
                                <signal.icon className="h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold leading-none">{signal.title}</p>
                                <p className="text-xs text-muted-foreground">{signal.note}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
