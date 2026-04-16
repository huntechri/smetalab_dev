'use client';

import { useActionState, useMemo, type ReactNode } from 'react';
import {
  Bell,
  Building2,
  ExternalLink,
  Loader2,
  Lock,
  MonitorCog,
  Save,
  Shield,
  UserCircle2,
} from 'lucide-react';
import { updateAccount, updatePassword } from '@/app/(login)/actions';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Separator } from '@/shared/ui/separator';
import { Switch } from '@/shared/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { useUserPreferences } from '@/features/settings/hooks/use-user-preferences';

type PermissionEntry = { code: string; level: 'read' | 'manage' };

type AccountState = {
  name?: string;
  error?: string;
  success?: string;
};

type PasswordState = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  error?: string;
  success?: string;
};

type SettingsProps = {
  user: {
    id: number;
    name: string | null;
    email: string;
    teamRole?: string | null;
    platformRole?: string | null;
  };
  team: {
    id: number;
    name: string;
  } | null;
  permissions: PermissionEntry[];
};

function roleLabel(role?: string | null) {
  if (!role) return '—';

  const map: Record<string, string> = {
    owner: 'Владелец',
    admin: 'Администратор',
    member: 'Участник',
    estimator: 'Сметчик',
    manager: 'Менеджер',
    superadmin: 'Суперадмин',
    support: 'Поддержка',
  };

  return map[role] ?? role;
}

function permissionBadgeClassName(level: PermissionEntry['level']) {
  if (level === 'manage') {
    return 'border-none bg-emerald-500/12 text-emerald-700';
  }

  return 'border-none bg-blue-500/12 text-blue-700';
}

export function UserSettingsPage({ user, team, permissions }: SettingsProps) {
  const [accountState, accountAction, isAccountPending] = useActionState<
    AccountState,
    FormData
  >(updateAccount, {});
  const [passwordState, passwordAction, isPasswordPending] = useActionState<
    PasswordState,
    FormData
  >(updatePassword, {});
  const {
    uiPreferences,
    setUiPreferences,
    notificationPreferences,
    setNotificationPreferences,
  } = useUserPreferences();

  const sortedPermissions = useMemo(
    () => [...permissions].sort((a, b) => a.code.localeCompare(b.code, 'ru')),
    [permissions],
  );

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-4">
      <h1 className="sr-only">
        Личный кабинет
      </h1>

      <Tabs defaultValue="profile" className="space-y-4">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-auto min-w-max gap-1 p-1">
            <TabsTrigger value="profile">Профиль</TabsTrigger>
            <TabsTrigger value="tenant">Организация</TabsTrigger>
            <TabsTrigger value="security">Безопасность</TabsTrigger>
            <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            <TabsTrigger value="interface">Интерфейс</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle2 className="h-4 w-4" />
                Профиль пользователя
              </CardTitle>
              <CardDescription>
                Редактируются только поля, которые поддерживаются backend.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:max-w-xl" action={accountAction}>
                <Field label="Имя" htmlFor="name">
                  <Input
                    id="name"
                    name="name"
                    defaultValue={accountState.name ?? user.name ?? ''}
                    required
                  />
                </Field>
                <Field label="Email" htmlFor="email">
                  <Input
                    id="email"
                    name="email"
                    defaultValue={user.email}
                    type="email"
                    required
                  />
                </Field>
                <Field label="Телефон (read-only)" htmlFor="userPhone">
                  <Input id="userPhone" value="Не задано" disabled readOnly />
                </Field>
                <StatusMessage
                  error={accountState.error}
                  success={accountState.success}
                />
                <Button
                  disabled={isAccountPending}
                  type="submit"
                  className="w-fit"
                >
                  {isAccountPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Сохранить профиль
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenant" forceMount>
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Организация и права
              </CardTitle>
              <CardDescription>
                Контекст текущего тенанта. Параметры организации доступны в
                режиме read-only.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:max-w-xl">
                <Field label="Организация (тенант)" htmlFor="tenantName">
                  <Input
                    id="tenantName"
                    value={team?.name ?? 'Не выбрана'}
                    readOnly
                    disabled
                  />
                </Field>
                <Field label="ID организации" htmlFor="tenantId">
                  <Input
                    id="tenantId"
                    value={team?.id ? String(team.id) : '—'}
                    readOnly
                    disabled
                  />
                </Field>
                <Field label="Роль в организации" htmlFor="tenantRole">
                  <Input
                    id="tenantRole"
                    value={roleLabel(user.teamRole)}
                    readOnly
                    disabled
                  />
                </Field>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <InfoRow
                  label="Платформенная роль"
                  value={roleLabel(user.platformRole)}
                />
                <InfoRow label="ID пользователя" value={String(user.id)} />
              </div>

              <Button variant="outline" asChild>
                <a href="/app/team">
                  Управление организацией
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Доступные модули</p>
                <div className="flex flex-wrap gap-2">
                  {sortedPermissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Нет данных о разрешениях.
                    </p>
                  ) : (
                    sortedPermissions.map((permission) => (
                      <Badge
                        key={permission.code}
                        variant="secondary"
                        className={permissionBadgeClassName(permission.level)}
                      >
                        {permission.code}: {permission.level}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Безопасность
              </CardTitle>
              <CardDescription>
                Смена пароля для текущего способа входа (email + пароль).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:max-w-xl" action={passwordAction}>
                <Field label="Текущий пароль" htmlFor="currentPassword">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    minLength={8}
                    maxLength={100}
                    defaultValue={passwordState.currentPassword}
                  />
                </Field>
                <Field label="Новый пароль" htmlFor="newPassword">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    minLength={8}
                    maxLength={100}
                    defaultValue={passwordState.newPassword}
                  />
                </Field>
                <Field label="Подтверждение пароля" htmlFor="confirmPassword">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    maxLength={100}
                    defaultValue={passwordState.confirmPassword}
                  />
                </Field>
                <StatusMessage
                  error={passwordState.error}
                  success={passwordState.success}
                />
                <Button
                  disabled={isPasswordPending}
                  type="submit"
                  className="w-fit"
                >
                  {isPasswordPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  Обновить пароль
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Уведомления
              </CardTitle>
              <CardDescription>
                Персональные каналы и типы событий. Сохраняются локально в
                браузере.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:max-w-xl">
              <PreferenceSwitch
                label="In-app уведомления"
                checked={notificationPreferences.inApp}
                onChange={(checked) =>
                  setNotificationPreferences((state) => ({
                    ...state,
                    inApp: checked,
                  }))
                }
              />
              <PreferenceSwitch
                label="Email уведомления"
                checked={notificationPreferences.email}
                onChange={(checked) =>
                  setNotificationPreferences((state) => ({
                    ...state,
                    email: checked,
                  }))
                }
              />
              <Separator />
              <PreferenceSwitch
                label="Изменения в смете"
                checked={notificationPreferences.estimateChanges}
                onChange={(checked) =>
                  setNotificationPreferences((state) => ({
                    ...state,
                    estimateChanges: checked,
                  }))
                }
              />
              <PreferenceSwitch
                label="Назначения в проект"
                checked={notificationPreferences.projectAssignments}
                onChange={(checked) =>
                  setNotificationPreferences((state) => ({
                    ...state,
                    projectAssignments: checked,
                  }))
                }
              />
              <PreferenceSwitch
                label="Комментарии и упоминания"
                checked={notificationPreferences.commentsMentions}
                onChange={(checked) =>
                  setNotificationPreferences((state) => ({
                    ...state,
                    commentsMentions: checked,
                  }))
                }
              />
              <PreferenceSwitch
                label="Дедлайны и просрочки"
                checked={notificationPreferences.deadlines}
                onChange={(checked) =>
                  setNotificationPreferences((state) => ({
                    ...state,
                    deadlines: checked,
                  }))
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MonitorCog className="h-4 w-4" />
                Интерфейс и предпочтения
              </CardTitle>
              <CardDescription>
                Локальные настройки удобства. На расчёты и других пользователей
                не влияют.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:max-w-xl">
              <PreferenceSwitch
                label="Тёмная тема"
                checked={uiPreferences.theme === 'dark'}
                onChange={(checked) =>
                  setUiPreferences((state) => ({
                    ...state,
                    theme: checked ? 'dark' : 'light',
                  }))
                }
              />
              <PreferenceSwitch
                label="Компактная плотность интерфейса"
                checked={uiPreferences.density === 'compact'}
                onChange={(checked) =>
                  setUiPreferences((state) => ({
                    ...state,
                    density: checked ? 'compact' : 'comfortable',
                  }))
                }
              />
              <PreferenceSwitch
                label="Подтверждать опасные действия"
                checked={uiPreferences.confirmDangerousActions}
                onChange={(checked) =>
                  setUiPreferences((state) => ({
                    ...state,
                    confirmDangerousActions: checked,
                  }))
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function PreferenceSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-card p-3">
      <Label className="text-sm font-normal">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}

function StatusMessage({ error, success }: { error?: string; success?: string }) {
  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (success) {
    return <p className="text-sm text-emerald-700">{success}</p>;
  }

  return null;
}
