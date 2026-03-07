import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

interface TeamHeaderCardProps {
    teamName?: string;
    membersCount: number;
}

export function TeamHeaderCard({ teamName, membersCount }: TeamHeaderCardProps) {
    return (
        <Card className="border-border/70">
            <CardHeader className="space-y-1">
                <CardTitle>
                    <h1 className="sr-only">Команда</h1>
                </CardTitle>
                <CardDescription>
                    {teamName || 'Команда'} · {membersCount} участников
                </CardDescription>
            </CardHeader>
        </Card>
    );
}
