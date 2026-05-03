import { Badge } from '@/shared/ui/badge';
import { CardShell, CardShellBody } from '@/shared/ui/card-shell';
import { Section, SectionHeader, SectionTitle } from '@/shared/ui/section';
import { StatusBadge, StatusIndicator, type StatusTone } from '@/shared/ui/status-badge';
import {
    primitiveVisualIconSizeClassNames,
    primitiveVisualTypographyClassNames,
} from '@/shared/ui/primitive-density';
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
        <Section aria-labelledby="today-title" className="lg:col-span-3" density="comfortable">
            <SectionHeader align="between">
                <SectionTitle id="today-title">Фокус на сегодня</SectionTitle>
                <Badge size="xs">Смена #42</Badge>
            </SectionHeader>

            <CardShell variant="glass" shadow="sm">
                <CardShellBody className="p-0" density="compact">
                    <div className="h-[200px] divide-y divide-border/20 overflow-y-auto">
                        {focusItems.map((item) => (
                            <div key={item.label} className="group flex cursor-pointer items-center justify-between gap-4 p-4 transition-all hover:bg-muted/20">
                                <div className="flex items-start gap-3">
                                    <StatusIndicator tone="brand" size="sm" pulse="pulse" className="mt-1.5 transition-transform duration-300 group-hover:scale-125" />
                                    <div>
                                        <p className={primitiveVisualTypographyClassNames.itemTitleInteractive}>{item.label}</p>
                                        <div className="mt-2 flex items-center gap-1.5">
                                            <Clock className={primitiveVisualIconSizeClassNames.mutedMeta} />
                                            <span className={primitiveVisualTypographyClassNames.mutedMeta}>{item.meta}</span>
                                        </div>
                                    </div>
                                </div>
                                <StatusBadge tone={item.tone}>
                                    {item.status}
                                </StatusBadge>
                            </div>
                        ))}
                    </div>
                </CardShellBody>
            </CardShell>
        </Section>
    );
}
