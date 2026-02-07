'use client';

import { useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Mail, MoreHorizontal, Shield, Trash2 } from 'lucide-react';
import { inviteTeamMember, removeTeamMember } from '@/app/(login)/actions';
import { usePermissions } from '@/hooks/use-permissions';

interface TeamMember {
    id: number;
    role: string;
    joinedAt: string;
    user: {
        id: number;
        name: string | null;
        email: string;
    };
}

interface TeamData {
    id: number;
    name: string;
    teamMembers: TeamMember[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TeamPage() {
    const { data: team, isLoading } = useSWR<TeamData>('/api/team', fetcher);
    const { hasPermission } = usePermissions();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'estimator' | 'manager'>('estimator');
    const [isInviting, setIsInviting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'estimator' | 'manager'>('all');

    const members = team?.teamMembers ?? [];

    const filteredMembers = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        return members.filter((member) => {
            const matchesRole = roleFilter === 'all' || member.role === roleFilter;
            if (!matchesRole) return false;
            if (!normalizedQuery) return true;
            const name = member.user.name?.toLowerCase() ?? '';
            const emailValue = member.user.email.toLowerCase();
            return name.includes(normalizedQuery) || emailValue.includes(normalizedQuery);
        });
    }, [members, roleFilter, searchQuery]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('email', email);
        formData.append('role', role);

        const result = await inviteTeamMember({ email, role }, formData);

        if (result && 'error' in result && result.error) {
            setMessage({ type: 'error', text: result.error });
        } else if (result && 'success' in result && result.success) {
            setMessage({ type: 'success', text: result.success });
            setEmail('');
        }
        setIsInviting(false);
    };

    const handleRemove = async (memberId: number) => {
        const formData = new FormData();
        formData.append('memberId', memberId.toString());

        const result = await removeTeamMember({ memberId }, formData);

        if (result && 'error' in result && result.error) {
            setMessage({ type: 'error', text: result.error });
        } else if (result && 'success' in result && result.success) {
            setMessage({ type: 'success', text: result.success });
            mutate('/api/team');
        }
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin':
                return 'default';
            case 'estimator':
                return 'secondary';
            case 'manager':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Администратор';
            case 'estimator':
                return 'Сметчик';
            case 'manager':
                return 'Менеджер';
            default:
                return role;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="border-border/70">
                <CardHeader className="space-y-1">
                    <CardTitle>
                        <h1 className="text-lg">Команда</h1>
                    </CardTitle>
                    <CardDescription>
                        {team?.name || 'Команда'} · {members.length} участников
                    </CardDescription>
                </CardHeader>
            </Card>

            {hasPermission('team', 'manage') && (
                <Card className="border-border/70">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-base">Пригласить участника</CardTitle>
                        <CardDescription>Введите email и выберите роль.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="colleague@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Роль</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between sm:w-40">
                                            {getRoleLabel(role)}
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuItem onClick={() => setRole('admin')}>
                                            Администратор
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setRole('estimator')}>
                                            Сметчик
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setRole('manager')}>
                                            Менеджер
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <Button type="submit" disabled={isInviting} className="w-full sm:w-auto">
                                <Mail className="mr-2 h-4 w-4" />
                                {isInviting ? 'Отправка...' : 'Пригласить'}
                            </Button>
                        </form>
                        {message && (
                            <p
                                className={`mt-3 text-sm ${
                                    message.type === 'error'
                                        ? 'text-destructive'
                                        : 'text-emerald-700'
                                }`}
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                {(() => {
                                    if (!message.text) return null;
                                    const urlMatch = message.text.match(/\(Dev Link: (http[^)]+)\)/);

                                    if (urlMatch) {
                                        const [fullMatch, url] = urlMatch;
                                        const textPart = message.text.split(fullMatch)[0];
                                        return (
                                            <>
                                                {textPart}
                                                <span className="text-muted-foreground">(Dev Link: </span>
                                                <a
                                                    href={url}
                                                    className="underline underline-offset-4 hover:text-blue-700"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Перейти
                                                </a>
                                                <span className="text-muted-foreground">)</span>
                                            </>
                                        );
                                    }
                                    return message.text;
                                })()}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

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
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Роль</Label>
                                <div
                                    role="group"
                                    aria-label="Фильтр по роли"
                                    className="flex flex-wrap gap-2"
                                >
                                    {(
                                        [
                                            { value: 'all', label: 'Все' },
                                            { value: 'admin', label: 'Администратор' },
                                            { value: 'estimator', label: 'Сметчик' },
                                            { value: 'manager', label: 'Менеджер' },
                                        ] as const
                                    ).map((item) => (
                                        <Button
                                            key={item.value}
                                            type="button"
                                            variant={roleFilter === item.value ? 'secondary' : 'outline'}
                                            size="sm"
                                            onClick={() => setRoleFilter(item.value)}
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
                                        <AvatarFallback>
                                            {member.user.name
                                                ? member.user.name
                                                      .split(' ')
                                                      .map((n) => n[0])
                                                      .join('')
                                                      .toUpperCase()
                                                      .slice(0, 2)
                                                : member.user.email.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium text-foreground">
                                            {member.user.name || member.user.email}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-3 sm:justify-end">
                                    <Badge variant={getRoleBadgeVariant(member.role)}>
                                        {getRoleLabel(member.role)}
                                    </Badge>
                                    {hasPermission('team', 'manage') && (
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Действия для ${
                                                            member.user.name || member.user.email
                                                        }`}
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
                                                    <AlertDialogDescription>
                                                        Доступ будет отозван.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        variant="destructive"
                                                        onClick={() => handleRemove(member.id)}
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
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                Нет участников, соответствующих фильтрам.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
