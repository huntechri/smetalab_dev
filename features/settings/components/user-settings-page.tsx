'use client';

import { useActionState, useMemo } from 'react';
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
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import {
  FieldStack,
  FormHelperText,
  FormLayout,
  FormSection,
  FormStatusMessage,
} from '@/shared/ui/form-layout';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Separator } from '@/shared/ui/separator';
import { Switch } from '@/shared/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { cn } from '@/lib/utils';
import { CardShellInset } from '@/shared/ui/card-shell';
import { primitiveCardShellInsetDensityP3 } from '@/shared/ui/primitive-surface';
import { Badge } from '@/shared/ui/badge';
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

function permissionBadgeVariant(level: PermissionEntry['level']): 'success' | 'info' {
  if (level === 'manage') {
    return 'success';
  }

  return 'info';
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
    <div className="mx-auto w-full max-w-7xl space-y-4">
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
                <UserCircle2 />
                Профиль пользователя
              </CardTitle>
              <CardDescription>
                Редактируются только поля, которые поддерживаются backend.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormLayout maxWidth="xl" action={accountAction}>
                <FieldStack label="Имя" htmlFor="name">
                  <Input size="default"
                    id="name"
                    name="name"
                    defaultValue={accountState.name ?? user.name ?? ''}
                    required
                  />
                </FieldStack>
                <FieldStack label="Email" htmlFor="email">
                  <Input size="default"
                    id="email"
                    name="email"
                    defaultValue={user.email}
                    type="email"
                    required
                  />
                </FieldStack>
                <FieldStack label="Телефон (read-only)" htmlFor="userPhone">
                  <Input size="default" id="userPhone" value="Не задано" disabled readOnly />
                </FieldStack>
                <StatusMessage
                  error={accountState.error}
                  success={accountState.success}
                />
                <Button
                  disabled={isAccountPending}
                  type="submit"
                  size="default"
                >
                  {isAccountPending ? (
                    <Loader2 />
                  ) : (
                    <Save />
                  )}
                  Сохранить профиль
                </Button>
              </FormLayout>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenant" forceMount>
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 />
                Организация и права
              </CardTitle>
              <CardDescription>
                Контекст текущего тенанта. Параметры организации доступны в
                режиме read-only.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSection maxWidth="xl">
                <FieldStack label="Организация (тенант)" htmlFor="tenantName">
                  <Input size="default"
                    id="tenantName"
                    value={team?.name ?? 'Не выбрана'}
                    readOnly
                    disabled
                  />
                </FieldStack>
                <FieldStack label="ID организации" htmlFor="tenantId">
                  <Input size="default"
                    id="tenantId"
                    value={team?.id ? String(team.id) : '—'}
                    readOnly
                    disabled
                  />
                </FieldStack>
                <FieldStack label="Роль в организации" htmlFor="tenantRole">
                  <Input size="default"
                    id="tenantRole"
                    value={roleLabel(user.teamRole)}
                    readOnly
                    disabled
                  />
                </FieldStack>
              </FormSection>

              <div className="grid gap-3 md:grid-cols-2">
                <InfoRow
                  label="Платформенная роль"
                  value={roleLabel(user.platformRole)}
                />
                <InfoRow label="ID пользователя" value={String(user.id)} />
              </div>

              <Button variant="outline" size="default" asChild>
                <a href="/app/team">
                  Управление организацией
                  <ExternalLink />
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
                        variant={permissionBadgeVariant(permission.level)}
                        size="xs"
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
                <Shield />
                Безопасность
              </CardTitle>
              <CardDescription>
                Смена пароля для текущего способа входа (email + пароль).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormLayout maxWidth="xl" action={passwordAction}>
                <FieldStack label="Текущий пароль" htmlFor="currentPassword">
                  <Input size="default"
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    minLength={8}
                    maxLength={100}
                    defaultValue={passwordState.currentPassword}
                  />
                </FieldStack>
                <FieldStack label="Новый пароль" htmlFor="newPassword">
                  <Input size="default"
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    minLength={8}
                    maxLength={100}
                    defaultValue={passwordState.newPassword}
                  />
                </FieldStack>
                <FieldStack label="Подтверждение пароля" htmlFor="confirmPassword">
                  <Input size="default"
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    maxLength={100}
                    defaultValue={passwordState.confirmPassword}
                  />
                </FieldStack>
                <StatusMessage
                  error={passwordState.error}
                  success={passwordState.success}
                />
                <Button
                  disabled={isPasswordPending}
                  type="submit"
                  size="default"
                >
                  {isPasswordPending ? (
                    <Loader2 />
                  ) : (
                    <Lock />
                  )}
                  Обновить пароль
                </Button>
              </FormLayout>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell />
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
                <MonitorCog />
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("rounded-md border bg-muted/30", primitiveCardShellInsetDensityP3)}>
      <FormHelperText>{label}</FormHelperText>
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
    <CardShellInset variant="muted" density="compact" className="flex items-center justify-between">
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </CardShellInset>
  );
}

function StatusMessage({ error, success }: { error?: string; success?: string }) {
  if (error) {
    return <FormStatusMessage tone="error">{error}</FormStatusMessage>;
  }

  if (success) {
    return <FormStatusMessage tone="success">{success}</FormStatusMessage>;
  }

  return null;
}
