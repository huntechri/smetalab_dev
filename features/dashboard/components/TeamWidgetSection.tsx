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
            <Card className="glass-card border-border/40 bg-background/50 shadow-sm backdrop-blur-md">
                <CardContent className="space-y-3 p-4">
                    {members.map((member) => (
                        <div key={member.name} className="flex items-center justify-between rounded-xl border border-border/20 bg-muted/10 p-3 transition-all hover:border-border/40 hover:bg-muted/20 hover:shadow-sm cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-border/50">
                                    <AvatarFallback className="bg-primary/5 text-[11px] font-bold text-primary">
                                        {member.name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="leading-tight">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{member.role}</p>
                                    <p className="text-sm font-semibold">{member.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className={cn('h-1.5 w-1.5 rounded-full', member.status === 'Онлайн' ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30')} />
                                <span className="text-[10px] font-medium text-muted-foreground">{member.status}</span>
                            </div>
                        </div>
                    ))}
                    <Button variant="outline">
                        Участники
                    </Button>
                </CardContent>
            </Card>
        </section>
    );
}
