import {
    Card,
    CardContent,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Building2,
    Truck,
    TrendingUp,
    AlertTriangle,
    Clock,
    Activity
} from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
} from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { CSSProperties } from 'react';

export default function AppHomePage() {
    return (
        <div className="relative space-y-4 animate-in fade-in duration-500 ease-out">
            {/* Background Decorative Elements - Subtle */}
            <div className="pointer-events-none absolute -top-12 -right-12 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

            <header className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <LayoutDashboard className="h-3.5 w-3.5" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Operational Hub</p>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Операционный центр
                    </h1>
                    <p className="max-w-xl text-sm text-muted-foreground leading-relaxed">
                        Мониторинг ресурсов, рисков и снабжения в реальном времени.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    {/* Actions removed as per request */}
                </div>
            </header>

            {/* Summary Grid - Compact */}
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
                    {[
                        { title: 'Объекты', value: '12', note: '3 пусконаладка', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                        { title: 'Поставки', value: '8', note: '2 подтверждения', icon: Truck, color: 'text-amber-600', bg: 'bg-amber-500/10' },
                        { title: 'Бюджет', value: '97%', note: 'Откл. −1.8%', icon: TrendingUp, color: 'text-sky-600', bg: 'bg-sky-500/10' },
                        { title: 'Риски', value: '5', note: '1 критический', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-500/10' },
                    ].map((item, idx) => (
                        <Card key={item.title} className={cn(
                            "glass-card hover:border-primary/20",
                            "flex flex-col justify-between p-4"
                        )} style={{ '--idx': idx } as CSSProperties}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.title}</p>
                                <div className={cn("rounded-md p-1.5", item.bg, item.color)}>
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

            <div className="grid gap-6 lg:grid-cols-5">
                {/* Critical Path - Larger span */}
                <section aria-labelledby="today-title" className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 id="today-title" className="text-lg font-semibold tracking-tight">Фокус на сегодня</h2>
                        <Badge className="bg-primary/5 text-primary border-primary/20 text-[10px] h-5">Смена #42</Badge>
                    </div>

                    <Card className="glass-card overflow-hidden">
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/10 h-[180px] overflow-y-auto">
                                {[
                                    { label: 'Закрытие актов «Северный»', meta: 'До 14:00', status: 'Согласование', color: 'text-emerald-700 bg-emerald-500/10' },
                                    { label: 'Поставка арматуры', meta: 'До 16:30', status: 'Снабжение', color: 'text-blue-700 bg-blue-500/10' },
                                    { label: 'Контроль качества (фасад)', meta: 'До 18:00', status: 'Технадзор', color: 'text-purple-700 bg-purple-500/10' },
                                ].map((item) => (
                                    <div key={item.label} className="group flex items-center justify-between gap-4 p-3.5 transition-all hover:bg-muted/10">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                            <div>
                                                <p className="text-sm font-semibold text-foreground leading-none">{item.label}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <Clock className="h-3 w-3 text-muted-foreground/60" />
                                                    <span className="text-[11px] text-muted-foreground">{item.meta}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={cn("border-0 rounded-sm font-bold text-[9px] uppercase px-1.5 py-0.5", item.color)}>
                                            {item.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Team & Tasks - Smaller sidebar feel */}
                <section aria-labelledby="team-title" className="lg:col-span-2 space-y-4">
                    <div className="space-y-4">
                        <h2 id="team-title" className="text-lg font-semibold tracking-tight">Команда</h2>
                        <Card className="glass-card">
                            <CardContent className="p-3 space-y-2">
                                {[
                                    { role: 'PM', name: 'Алина М.', status: 'Онлайн' },
                                    { role: 'Логист', name: 'Игорь П.', status: 'В пути' },
                                ].map((member) => (
                                    <div key={member.name} className="flex items-center justify-between rounded-lg border border-border/10 bg-muted/5 p-2.5 transition-all hover:bg-muted/10">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-primary/5 text-[10px] font-bold text-primary">
                                                    {member.name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="leading-tight">
                                                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">{member.role}</p>
                                                <p className="text-sm font-bold">{member.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className={cn("h-1 w-1 rounded-full", member.status === 'Онлайн' ? 'bg-emerald-500' : 'bg-muted-foreground/20')} />
                                            <span className="text-[9px] font-medium text-muted-foreground">{member.status}</span>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" className="w-full text-xs h-8 border-border/40 font-semibold mt-1">
                                    Участники
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>

            {/* Signals Section - Full width compact */}
            <section aria-labelledby="signals-title" className="space-y-4">
                <h2 id="signals-title" className="text-lg font-semibold tracking-tight flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Отклонения
                </h2>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {[
                        { title: 'Задержка бетона (3ч)', status: 'Риск', note: 'Уведомить подрядчика', icon: AlertTriangle, color: 'text-rose-600 bg-rose-500/5' },
                        { title: 'Бюджет «Северный»', status: 'Норма', note: 'Экономия 1.8%', icon: Activity, color: 'text-emerald-600 bg-emerald-500/5' },
                        { title: 'Пересменка «Лесной»', status: 'В работе', note: 'Обновить график', icon: Clock, color: 'text-sky-600 bg-sky-500/5' },
                    ].map((signal) => (
                        <Card key={signal.title} className="glass-card p-3 border-border/20">
                            <div className="flex items-start gap-3">
                                <div className={cn("p-1.5 rounded-md shrink-0", signal.color)}>
                                    <signal.icon className="h-3.5 w-3.5" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold leading-tight">{signal.title}</p>
                                    <p className="text-[11px] text-muted-foreground leading-tight">{signal.note}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
