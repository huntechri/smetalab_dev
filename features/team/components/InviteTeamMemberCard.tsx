import { TeamMessage, TeamRole } from '../types';
import { Button } from '@/shared/ui/button';

import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { Mail, Shield } from 'lucide-react';
import { getRoleLabel, parseDevLinkMessage } from '../lib/team-utils';

interface InviteTeamMemberCardProps {
    email: string;
    role: TeamRole;
    isInviting: boolean;
    message: TeamMessage | null;
    onEmailChange: (value: string) => void;
    onRoleChange: (role: TeamRole) => void;
    onSubmit: (event: React.FormEvent) => Promise<void>;
}

export function InviteTeamMemberCard({
    email,
    role,
    isInviting,
    message,
    onEmailChange,
    onRoleChange,
    onSubmit,
}: InviteTeamMemberCardProps) {
    const parsedMessage = message ? parseDevLinkMessage(message.text) : null;

    return (
        <div className="p-6">
            <div className="space-y-1 mb-6">
                <h2 className="text-base font-medium">Пригласить участника</h2>
                <p className="text-sm text-muted-foreground">Введите email и выберите роль.</p>
            </div>
            <div>
                <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1 space-y-1.5">
                        <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="colleague@company.com"
                            value={email}
                            onChange={(event) => onEmailChange(event.target.value)}
                            className="h-9 text-sm transition-colors"
                            required
                        />
                    </div>
                    <div className="space-y-1.5 shrink-0">
                        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Роль</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="standard" className="w-full justify-between sm:w-44 h-9">
                                    {getRoleLabel(role)}
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => onRoleChange('admin')}>Администратор</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onRoleChange('estimator')}>Сметчик</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onRoleChange('manager')}>Менеджер</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Button type="submit" variant="standard" disabled={isInviting} className="w-full sm:w-auto h-9 shrink-0">
                        <Mail className="mr-2 h-4 w-4" />
                        {isInviting ? 'Отправка...' : 'Пригласить'}
                    </Button>
                </form>

                {message && (
                    <p
                        className={`mt-3 text-sm ${message.type === 'error' ? 'text-destructive' : 'text-emerald-700'}`}
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {parsedMessage ? (
                            <>
                                {parsedMessage.textPart}
                                <span className="text-muted-foreground">(Dev Link: </span>
                                <a
                                    href={parsedMessage.url}
                                    className="underline underline-offset-4 hover:text-blue-700"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Перейти
                                </a>
                                <span className="text-muted-foreground">)</span>
                            </>
                        ) : (
                            message.text
                        )}
                    </p>
                )}
            </div>
        </div>
    );
}
