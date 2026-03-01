import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { cn } from '@/lib/utils';

const members = [
    { role: 'PM', name: 'Алина М.', status: 'Онлайн' },
    { role: 'Логист', name: 'Игорь П.', status: 'В пути' },
] as const;

export function TeamWidgetSection() {
    return (
        <section aria-labelledby="team-title" className="space-y-4 lg:col-span-2">
            <h2 id="team-title" className="text-lg font-semibold tracking-tight">Команда</h2>
            <Card className="glass-card">
                <CardContent className="space-y-2 p-3">
                    {members.map((member) => (
                        <div key={member.name} className="flex items-center justify-between rounded-lg border border-border/10 bg-muted/5 p-2.5 transition-all hover:bg-muted/10">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/5 text-[10px] font-bold text-primary">
                                        {member.name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="leading-tight">
                                    <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">{member.role}</p>
                                    <p className="text-sm font-bold">{member.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className={cn('h-1 w-1 rounded-full', member.status === 'Онлайн' ? 'bg-emerald-500' : 'bg-muted-foreground/20')} />
                                <span className="text-[9px] font-medium text-muted-foreground">{member.status}</span>
                            </div>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" className="mt-1 h-8 w-full border-border/40 text-xs font-semibold">
                        Участники
                    </Button>
                </CardContent>
            </Card>
        </section>
    );
}
