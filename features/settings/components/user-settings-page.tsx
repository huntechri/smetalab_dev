'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { Loader2, Lock, Save, Shield, UserCircle2 } from 'lucide-react';
import { updateAccount, updatePassword } from '@/app/(login)/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  defaultNotificationsPreferences,
  defaultUiPreferences,
  parseNotificationPreferences,
  parseUiPreferences,
  type NotificationsPreferences,
  type UiPreferences,
} from '@/features/settings/lib/preferences';

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

const UI_STORAGE_KEY = 'smetalab.ui.preferences';
const NOTIFICATIONS_STORAGE_KEY = 'smetalab.notifications.preferences';

function roleLabel(role?: string | null) {
  if (!role) return '—';
  const map: Record<string, string> = {
    owner: 'Owner',
    admin: 'Администратор',
    member: 'Участник',
    estimator: 'Сметчик',
    manager: 'Менеджер',
  };

  return map[role] ?? role;
}

export function UserSettingsPage({ user, team, permissions }: SettingsProps) {
  const [accountState, accountAction, isAccountPending] = useActionState<AccountState, FormData>(updateAccount, {});
  const [passwordState, passwordAction, isPasswordPending] = useActionState<PasswordState, FormData>(updatePassword, {});
  const [uiPreferences, setUiPreferences] = useState<UiPreferences>(defaultUiPreferences);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationsPreferences>(defaultNotificationsPreferences);

  useEffect(() => {
    setUiPreferences(parseUiPreferences(window.localStorage.getItem(UI_STORAGE_KEY)));
    setNotificationPreferences(
      parseNotificationPreferences(window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)),
    );
  }, []);

  useEffect(() => {
    window.localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(uiPreferences));
  }, [uiPreferences]);

  useEffect(() => {
    window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notificationPreferences));
  }, [notificationPreferences]);

  const sortedPermissions = useMemo(
    () => [...permissions].sort((a, b) => a.code.localeCompare(b.code, 'ru')),
    [permissions],
  );

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Личный кабинет</h1>
        <p className="text-sm text-muted-foreground">
          Управляйте профилем, безопасностью и персональными настройками интерфейса.
        </p>
      </header>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="tenant">Организация</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="interface">Интерфейс</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCircle2 className="h-4 w-4" /> Профиль</CardTitle>
              <CardDescription>Изменяйте только поддерживаемые поля профиля.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:max-w-xl" action={accountAction}>
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input id="name" name="name" defaultValue={accountState.name ?? user.name ?? ''} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" defaultValue={user.email} type="email" required />
                </div>
                <div className="space-y-2">
                  <Label>Телефон</Label>
                  <Input value="Не задано" disabled readOnly />
                </div>
                {accountState.error && <p className="text-sm text-destructive">{accountState.error}</p>}
                {accountState.success && <p className="text-sm text-emerald-700">{accountState.success}</p>}
                <Button disabled={isAccountPending} type="submit" className="w-fit">
                  {isAccountPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Сохранить профиль
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenant">
          <Card>
            <CardHeader>
              <CardTitle>Организация и доступы</CardTitle>
              <CardDescription>Контекст текущего тенанта и ваши роли (read-only).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Текущая организация</p>
                  <p className="font-medium">{team?.name ?? 'Не выбрана'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Роль в организации</p>
                  <p className="font-medium">{roleLabel(user.teamRole)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Платформенная роль</p>
                  <p className="font-medium">{roleLabel(user.platformRole)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID пользователя / организации</p>
                  <p className="font-medium">{user.id} / {team?.id ?? '—'}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Доступные модули</p>
                <div className="flex flex-wrap gap-2">
                  {sortedPermissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Нет данных о разрешениях.</p>
                  ) : (
                    sortedPermissions.map((permission) => (
                      <Badge key={permission.code} variant="secondary">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> Безопасность</CardTitle>
              <CardDescription>Смена пароля для текущего способа входа (email + пароль).</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:max-w-xl" action={passwordAction}>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Текущий пароль</Label>
                  <Input id="currentPassword" name="currentPassword" type="password" required minLength={8} maxLength={100} defaultValue={passwordState.currentPassword} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Новый пароль</Label>
                  <Input id="newPassword" name="newPassword" type="password" required minLength={8} maxLength={100} defaultValue={passwordState.newPassword} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} maxLength={100} defaultValue={passwordState.confirmPassword} />
                </div>
                {passwordState.error && <p className="text-sm text-destructive">{passwordState.error}</p>}
                {passwordState.success && <p className="text-sm text-emerald-700">{passwordState.success}</p>}
                <Button disabled={isPasswordPending} type="submit" className="w-fit">
                  {isPasswordPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                  Обновить пароль
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Уведомления</CardTitle>
              <CardDescription>Персональные каналы и типы событий (сохраняются в браузере).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:max-w-xl">
              <NotificationSwitch label="In-app уведомления" checked={notificationPreferences.inApp} onChange={(checked) => setNotificationPreferences((current) => ({ ...current, inApp: checked }))} />
              <NotificationSwitch label="Email уведомления" checked={notificationPreferences.email} onChange={(checked) => setNotificationPreferences((current) => ({ ...current, email: checked }))} />
              <Separator />
              <NotificationSwitch label="Изменения в смете" checked={notificationPreferences.estimateChanges} onChange={(checked) => setNotificationPreferences((current) => ({ ...current, estimateChanges: checked }))} />
              <NotificationSwitch label="Назначения в проект" checked={notificationPreferences.projectAssignments} onChange={(checked) => setNotificationPreferences((current) => ({ ...current, projectAssignments: checked }))} />
              <NotificationSwitch label="Комментарии и упоминания" checked={notificationPreferences.commentsMentions} onChange={(checked) => setNotificationPreferences((current) => ({ ...current, commentsMentions: checked }))} />
              <NotificationSwitch label="Дедлайны и просрочки" checked={notificationPreferences.deadlines} onChange={(checked) => setNotificationPreferences((current) => ({ ...current, deadlines: checked }))} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface">
          <Card>
            <CardHeader>
              <CardTitle>Интерфейс и предпочтения</CardTitle>
              <CardDescription>Локальные настройки удобства, не влияющие на других пользователей.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:max-w-xl">
              <NotificationSwitch label="Тёмная тема" checked={uiPreferences.theme === 'dark'} onChange={(checked) => setUiPreferences((current) => ({ ...current, theme: checked ? 'dark' : 'light' }))} />
              <NotificationSwitch label="Компактная плотность интерфейса" checked={uiPreferences.density === 'compact'} onChange={(checked) => setUiPreferences((current) => ({ ...current, density: checked ? 'compact' : 'comfortable' }))} />
              <NotificationSwitch label="Подтверждать опасные действия" checked={uiPreferences.confirmDangerousActions} onChange={(checked) => setUiPreferences((current) => ({ ...current, confirmDangerousActions: checked }))} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <Label className="text-sm font-normal">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
