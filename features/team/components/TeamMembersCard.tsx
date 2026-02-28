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
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { getMemberInitials, getRoleBadgeVariant, getRoleLabel } from '../lib/team-utils';
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
        <Card className="border-border/70">
            <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <CardTitle className="text-base">Участники</CardTitle>
                        <CardDescription>
                            {filteredMembers.length} из {members.length}
                        </CardDescription>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
                        <div className="space-y-2">
                            <Label htmlFor="search">Поиск</Label>
                            <Input
                                id="search"
                                type="search"
                                placeholder="Имя или email"
                                value={searchQuery}
                                onChange={(event) => onSearchQueryChange(event.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Роль</Label>
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
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {filteredMembers.map((member) => (
                        <div
                            key={member.id}
                            className="flex flex-col gap-3 rounded-lg border border-border/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
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
                                <Badge variant={getRoleBadgeVariant(member.role)}>{getRoleLabel(member.role)}</Badge>
                                {canManageMembers && (
                                    <AlertDialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Действия для ${member.user.name || member.user.email}`}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
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
            </CardContent>
        </Card>
    );
}
