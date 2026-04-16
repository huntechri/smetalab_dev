import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/components/ui/button';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { Label } from '@/shared/ui/label';
import { SearchInput } from '@/shared/ui/search-input';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMemberInitials, getRoleBadgeClassName, getRoleLabel } from '../lib/team-utils';
import { TeamMember, TeamRoleFilter } from '../types';

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
        <div className="flex flex-col p-6 space-y-4">
            <div>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                    <div className="space-y-1">
                        <h2 className="text-base font-medium">Участники</h2>
                        <p className="text-sm text-muted-foreground">
                            {filteredMembers.length} из {members.length}
                        </p>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:w-auto xl:flex-row xl:items-end">
                        <div className="space-y-1.5">
                            <Label htmlFor="search" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Поиск</Label>
                            <SearchInput
                                id="search"
                                placeholder="Имя или email"
                                value={searchQuery}
                                onChange={(event) => onSearchQueryChange(event.target.value)}
                                className="w-[min(20rem,calc(100vw-2rem))]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Роль</Label>
                            <div role="group" aria-label="Фильтр по роли" className="flex flex-wrap gap-2">
                                {roleFilterItems.map((item) => (
                                    <Button
                                        key={item.value}
                                        type="button"
                                        variant={roleFilter === item.value ? 'secondary' : 'default'}
                                        className={cn(
                                            "h-8 px-3 text-[14px] font-medium leading-[20px] shadow-none transition-all",
                                            roleFilter === item.value ? "bg-secondary border-border" : "bg-white"
                                        )}
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
                        <div
                            key={member.id}
                            className="group flex flex-col gap-3 rounded-xl border border-border/40 bg-background hover:bg-muted/30 hover:shadow-sm hover:border-border/60 transition-all px-4 py-3 sm:flex-row sm:items-center sm:justify-between overflow-hidden"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="size-9">
                                    <AvatarFallback>{getMemberInitials(member.user.name, member.user.email)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium text-foreground">{member.user.name || member.user.email}</p>
                                    <p className="text-xs text-muted-foreground">{member.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 sm:justify-end">
                                <Badge variant="secondary" className={getRoleBadgeClassName(member.role)}>{getRoleLabel(member.role)}</Badge>
                                {canManageMembers && (
                                    <AlertDialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="default"
                                                    size="icon-sm"
                                                    className="size-7 rounded-[6px] text-muted-foreground hover:text-foreground transition-all"
                                                    aria-label={`Действия для ${member.user.name || member.user.email}`}
                                                >
                                                    <MoreHorizontal className="size-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Удалить
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Удалить участника?</AlertDialogTitle>
                                                <AlertDialogDescription>Доступ будет отозван.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                                <AlertDialogAction
                                                    variant="destructive"
                                                    className="h-8 px-3 rounded-[7.6px]"
                                                    onClick={() => onRemoveMember(member.id)}
                                                >
                                                    Удалить
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredMembers.length === 0 && (
                        <p className="py-6 text-center text-sm text-muted-foreground">Нет участников, соответствующих фильтрам.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
