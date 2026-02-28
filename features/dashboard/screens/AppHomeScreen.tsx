import { LayoutDashboard } from 'lucide-react';
import { SignalsSection } from '../components/SignalsSection';
import { SummarySection } from '../components/SummarySection';
import { TeamWidgetSection } from '../components/TeamWidgetSection';
import { TodayFocusSection } from '../components/TodayFocusSection';

export function AppHomeScreen() {
    return (
        <div className="relative space-y-4 animate-in fade-in duration-500 ease-out">
            <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

            <header className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <LayoutDashboard className="h-3.5 w-3.5" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Operational Hub</p>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Операционный центр</h1>
                    <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                        Мониторинг ресурсов, рисков и снабжения в реальном времени.
                    </p>
                </div>
            </header>

            <SummarySection />

            <div className="grid gap-6 lg:grid-cols-5">
                <TodayFocusSection />
                <TeamWidgetSection />
            </div>

            <SignalsSection />
        </div>
    );
}
