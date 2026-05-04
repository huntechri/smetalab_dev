import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { CardShell, CardShellBody, CardShellInset } from '@/shared/ui/card-shell';
import { Section, SectionTitle } from '@/shared/ui/section';
import { StatusIndicator, type StatusIndicatorPulse, type StatusTone } from '@/shared/ui/status-badge';
import { primitiveVisualTypographyClassNames } from '@/shared/ui/primitive-surface';

const members = [
    { role: 'PM', name: 'Алина М.', status: 'Онлайн' },
    { role: 'Логист', name: 'Игорь П.', status: 'В пути' },
] as const;

const memberStatusIndicator: Record<typeof members[number]['status'], { tone: StatusTone; pulse: StatusIndicatorPulse }> = {
    Онлайн: { tone: 'success', pulse: 'pulse' },
    'В пути': { tone: 'neutral', pulse: 'none' },
};

export function TeamWidgetSection() {
    return (
        <Section aria-labelledby="team-title" className="lg:col-span-2" density="comfortable">
            <SectionTitle id="team-title">Команда</SectionTitle>
            <CardShell variant="glass" shadow="sm">
                <CardShellBody className="space-y-3" density="compact">
                    {members.map((member) => {
                        const indicator = memberStatusIndicator[member.status];

                        return (
                            <CardShellInset key={member.name} className="flex cursor-pointer items-center justify-between transition-all hover:border-border/40 hover:bg-muted/20 hover:shadow-sm" density="compact" variant="subtle">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border border-border/50">
                                        <AvatarFallback className={`${primitiveVisualTypographyClassNames.compactAvatarInitials} bg-primary/5`}>
                                            {member.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="leading-tight">
                                        <p className={primitiveVisualTypographyClassNames.compactCaption}>{member.role}</p>
                                        <p className="text-sm font-semibold">{member.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <StatusIndicator tone={indicator.tone} pulse={indicator.pulse} size="sm" />
                                    <span className="text-[0.625rem] font-medium text-muted-foreground">{member.status}</span>
                                </div>
                            </CardShellInset>
                        );
                    })}
                    <Button variant="outline" size="default">
                        Участники
                    </Button>
                </CardShellBody>
            </CardShell>
        </Section>
    );
}
