import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { SearchInput } from '@/shared/ui/search-input';
import { StatusBadge } from '@/shared/ui/status-badge';
import { ActionMenu } from '@/shared/ui/action-menu';
import { Trash2 } from 'lucide-react';
import { Surface } from '@/shared/ui/surface';
import { getMemberInitials, getRoleBadgeVariant, getRoleLabel } from '../lib/team-utils';
import { TeamMember, TeamRoleFilter } from '../types';
import { primitiveVisualTypographyClassNames } from '@/shared/ui/primitive-surface';

interface TeamMembersCardProps {
    members: TeamMember[];
    filteredMembers: TeamMember[];
    roleFilter: TeamRoleFilter;
    searchQuery: string;
    canManageMembers: boolean;
    onRoleFilterChange: (role: TeamRoleFilter) => void;
    onSearchQueryChange: (value: string) => void;
    onRemoveMember: (memberId: number) => Promise<void>;
}

const roleFilterItems: ReadonlyArray<{ value: TeamRoleFilter; label: string }> = [
    { value: 'all', label: 'Все' },
    { value: 'admin', label: 'Администратор' },
    { value: 'estimator', label: 'Сметчик' },
    { value: 'manager', label: 'Менеджер' },
];

export function TeamMembersCard({
    members,
    filteredMembers,
    roleFilter,
    searchQuery,
    canManageMembers,
    onRoleFilterChange,
    onSearchQueryChange,
    onRemoveMember,
}: TeamMembersCardProps) {
    return (
        <Surface variant="card" density="comfortable">
            <div className="flex flex-col space-y-4">
                <div>
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                    <div className="space-y-1">
                        <h2 className={primitiveVisualTypographyClassNames.sectionTitle}>Участники</h2>
                        <p className={primitiveVisualTypographyClassNames.mutedMeta}>
                            {filteredMembers.length} из {members.length}
                        </p>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:w-auto xl:flex-row xl:items-end">
                        <div className="space-y-1.5">
                            <Label htmlFor="search" className={primitiveVisualTypographyClassNames.compactLabel}>Поиск</Label>
                            <div className="w-full max-w-xs sm:max-w-sm">
                                <SearchInput
                                    id="search"
                                    placeholder="Имя или email"
                                    value={searchQuery}
                                    onChange={(event) => onSearchQueryChange(event.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className={primitiveVisualTypographyClassNames.compactLabel}>Роль</Label>
                            <div role="group" aria-label="Фильтр по роли" className="flex flex-wrap gap-2">
                                {roleFilterItems.map((item) => (
                                    <Button
                                        key={item.value}
                                        type="button"
                                        variant={roleFilter === item.value ? 'secondary' : 'outline'}
                                        size="sm"
                                        onClick={() => onRoleFilterChange(item.value)}
                                        aria-pressed={roleFilter === item.value}
                                        aria-label={`Фильтр: ${item.label}`}
                                    >
                                        {item.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div className="space-y-2">
                    {filteredMembers.map((member) => (
                        <Surface
                            key={member.id}
                            variant="card"
                            density="compact"
                            shadow="none"
                            border="hairline"
                            className="flex flex-col gap-3 bg-background hover:bg-muted/30 hover:shadow-sm hover:border-border/60 transition-all sm:flex-row sm:items-center sm:justify-between overflow-hidden"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="size-9">
                                    <AvatarFallback>{getMemberInitials(member.user.name, member.user.email)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-0.5">
                                    <p className={primitiveVisualTypographyClassNames.itemTitle}>{member.user.name || member.user.email}</p>
                                    <p className={primitiveVisualTypographyClassNames.mutedMeta}>{member.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 sm:justify-end">
                                <StatusBadge tone={getRoleBadgeVariant(member.role)}>{getRoleLabel(member.role)}</StatusBadge>
                                {canManageMembers && (
                                    <ActionMenu
                                        ariaLabel={`Действия для ${member.user.name || member.user.email}`}
                                        items={[
                                            {
                                                label: 'Удалить',
                                                icon: <Trash2 />,
                                                variant: 'destructive',
                                                requiresConfirmation: true,
                                                confirmTitle: 'Удалить участника?',
                                                confirmDescription: 'Доступ будет отозван.',
                                                confirmLabel: 'Удалить',
                                                onClick: () => onRemoveMember(member.id),
                                            },
                                        ]}
                                    />
                                )}
                            </div>
                        </Surface>
                    ))}
                    {filteredMembers.length === 0 && (
                        <p className={`py-6 text-center ${primitiveVisualTypographyClassNames.mutedMeta}`}>Нет участников, соответствующих фильтрам.</p>
                    )}
                </div>
            </div>
        </div>
        </Surface>
    );
}
