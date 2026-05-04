import { Card } from '@/shared/ui/card';
import { cn } from '@/lib/utils';
import { Section } from '@/shared/ui/section';
import {
    primitiveVisualIconSizeClassNames,
} from '@/shared/ui/primitive-controls';
import {
    primitiveVisualSemanticToneClassNames,
    primitiveVisualSurfaceClassNames,
    primitiveVisualTypographyClassNames,
} from '@/shared/ui/primitive-surface';
import { Activity, AlertTriangle, Clock } from 'lucide-react';

const signals = [
    { title: 'Задержка бетона (3ч)', note: 'Уведомить подрядчика', icon: AlertTriangle, tone: 'danger' },
    { title: 'Бюджет «Северный»', note: 'Экономия 1.8%', icon: Activity, tone: 'success' },
    { title: 'Пересменка «Лесной»', note: 'Обновить график', icon: Clock, tone: 'info' },
] as const;

export function SignalsSection() {
    return (
        <Section density="comfortable" aria-labelledby="signals-title">
            <h2 id="signals-title" className={primitiveVisualTypographyClassNames.dashboardSectionTitle}>
                <Activity className={cn(primitiveVisualIconSizeClassNames.section, 'text-primary')} />
                Отклонения
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {signals.map((signal) => (
                    <Card key={signal.title} className={primitiveVisualSurfaceClassNames.interactiveGlassCard}>
                        <div className="flex items-start gap-4">
                            <div
                                className={cn(
                                    primitiveVisualSurfaceClassNames.toneIconFrame,
                                    primitiveVisualSemanticToneClassNames[signal.tone],
                                )}
                            >
                                <signal.icon className={primitiveVisualIconSizeClassNames.section} />
                            </div>
                            <div className="space-y-1">
                                <p className={primitiveVisualTypographyClassNames.itemTitle}>{signal.title}</p>
                                <p className={primitiveVisualTypographyClassNames.mutedMeta}>{signal.note}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </Section>
    );
}
