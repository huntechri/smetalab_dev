import { Users } from 'lucide-react';

interface TeamHeaderCardProps {
    teamName?: string;
    membersCount: number;
}

export function TeamHeaderCard({ teamName, membersCount }: TeamHeaderCardProps) {
    return (
        <div className="flex flex-col space-y-1.5 p-6 bg-muted/20">
            <h1 className="text-xl font-semibold leading-none tracking-tight text-foreground">
                {teamName || 'Команда'}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {membersCount} {membersCount === 1 ? 'участник' : membersCount > 1 && membersCount < 5 ? 'участника' : 'участников'}
            </p>
        </div>
    );
}
