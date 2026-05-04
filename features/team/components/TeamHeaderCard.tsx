import { Users } from 'lucide-react';
import { Surface } from '@/shared/ui/surface';
import { primitiveVisualTypographyClassNames } from '@/shared/ui/primitive-surface';

interface TeamHeaderCardProps {
    teamName?: string;
    membersCount: number;
}

export function TeamHeaderCard({ teamName, membersCount }: TeamHeaderCardProps) {
    return (
        <Surface variant="card" density="comfortable">
            <div className="flex flex-col space-y-1.5">
                <h1 className={`${primitiveVisualTypographyClassNames.dialogTitle} font-semibold text-foreground`}>
                    {teamName || 'Команда'}
                </h1>
                <p className={`${primitiveVisualTypographyClassNames.mutedMeta} flex items-center gap-1.5`}>
                    <Users className="size-4" />
                    {membersCount} {membersCount === 1 ? 'участник' : membersCount > 1 && membersCount < 5 ? 'участника' : 'участников'}
                </p>
            </div>
        </Surface>
    );
}
