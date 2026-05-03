import { TeamMessage, TeamRole } from '../types';
import { Button } from '@/shared/ui/button';
import { FormLayout } from '@/shared/ui/form-layout';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { Mail, Shield } from 'lucide-react';
import { Surface } from '@/shared/ui/surface';
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

function getStatusMessageClassName(type: TeamMessage['type']) {
    return type === 'error' ? 'text-destructive' : 'text-success';
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
        <Surface variant="card" density="comfortable" shadow="sm" className="space-y-1">
            <div>
                <h2 className="text-base font-medium">Пригласить участника</h2>
                <p className="text-sm text-muted-foreground">Введите email и выберите роль.</p>
            </div>
            <div>
                <FormLayout onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1 space-y-1.5">
                        <Label htmlFor="email" className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                        <Input size="default"
                            id="email"
                            type="email"
                            placeholder="colleague@company.com"
                            value={email}
                            onChange={(event) => onEmailChange(event.target.value)}
                            required
                       />
                    </div>
                    <div className="space-y-1.5 shrink-0">
                        <Label className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">Роль</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="default">
                                    {getRoleLabel(role)}
                                    <Shield className="size-3.5 text-muted-foreground opacity-70" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => onRoleChange('admin')}>Администратор</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onRoleChange('estimator')}>Сметчик</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onRoleChange('manager')}>Менеджер</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Button type="submit" variant="primary" size="default" disabled={isInviting}>
                        <Mail className="size-3.5" />
                        {isInviting ? 'Отправка...' : 'Пригласить'}
                    </Button>
                </FormLayout>

                {message && (
                    <p
                        className={`mt-3 text-sm ${getStatusMessageClassName(message.type)}`}
                        aria-live="polite"
                        aria-atomic="true"
                   >
                        {parsedMessage ? (
                            <>
                                {parsedMessage.textPart}
                                <span className="text-muted-foreground">(Dev Link: </span>
                                <a
                                    href={parsedMessage.url}
                                    className="underline underline-offset-4 hover:text-primary"
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
        </Surface>
    );
}
