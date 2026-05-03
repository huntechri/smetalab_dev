import { Badge } from '@/shared/ui/badge';
import { CardShell, CardShellBody } from '@/shared/ui/card-shell';
import { Section, SectionHeader, SectionTitle } from '@/shared/ui/section';
import { DashboardFocusItem } from '@/shared/ui/dashboard-focus-item';
import type { StatusTone } from '@/shared/ui/status-badge';

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
                <CardShellBody density="compact">
                    <div className="h-48 divide-y divide-border/20 overflow-y-auto">
                        {focusItems.map((item) => (
                            <DashboardFocusItem
                                key={item.label}
                                label={item.label}
                                meta={item.meta}
                                status={item.status}
                                tone={item.tone}
                            />
                        ))}
                    </div>
                </CardShellBody>
            </CardShell>
        </Section>
    );
}
