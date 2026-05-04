'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { FormLayout } from '@/shared/ui/form-layout';
import { HiddenInput } from '@/shared/ui/hidden-input';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { CircleIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp } from '@/app/(login)/actions';
import { ActionState } from '@/lib/infrastructure/auth/middleware';
import { AuthStatusMessage } from './AuthFormShell';
import {
  primitiveAuthPageBackgroundClassName,
  primitiveMarketingBgBlobClassNames,
  primitiveMarketingBgBlobPlacementClassNames,
  primitiveAuthMarketingGridClassName,
  primitiveAuthBrandIconClassName,
  primitiveAuthFeatureCardClassName,
  primitiveAuthFeatureCardLabelClassName,
  primitiveAuthFeatureCardValueClassName,
  primitiveAuthMarketingHeadingClassName,
  primitiveAuthMarketingSubtextClassName,
  primitiveAuthFormTitleClassName,
  primitiveAuthFormDescriptionClassName,
  primitiveAuthPanelShadowClassName,
  primitiveAuthPanelBorderClassName,
} from '@/shared/ui/primitive-marketing';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const emailParam = searchParams.get('email');
  const verifiedState = searchParams.get('verified');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );
  const [showPassword, setShowPassword] = useState(false);
  const isSignIn = mode === 'signin';
  const formTitle = isSignIn ? 'Войти в Smetalab' : 'Создать аккаунт';
  const formSubtitle = isSignIn
    ? 'Новый пользователь?'
    : 'Уже есть аккаунт?';
  const switchText = isSignIn
    ? 'Создать аккаунт'
    : 'Войти в существующий аккаунт';

  return (
    <div className={primitiveAuthPageBackgroundClassName}>
      <a
        href="#auth-card"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground"
      >
        Пропустить к форме входа
      </a>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className={`absolute ${primitiveMarketingBgBlobPlacementClassNames.topLeft} ${primitiveMarketingBgBlobClassNames.orange} blur-3xl`}
        />
        <div
          className={`absolute ${primitiveMarketingBgBlobPlacementClassNames.bottomRight} ${primitiveMarketingBgBlobClassNames.teal} blur-3xl`}
        />
      </div>

      <main className={primitiveAuthMarketingGridClassName}>
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className={primitiveAuthBrandIconClassName}>S</div>
            <div>
              <p className="text-xs uppercase tracking-ultra text-white/70">
                Smetalab
              </p>
              <p className="text-sm font-semibold">BuildOS</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-super text-white/70">
              {isSignIn ? 'Client access' : 'Start building'}
            </p>
            <h1 className={primitiveAuthMarketingHeadingClassName}>
              {isSignIn
                ? 'Возвращайтесь к прозрачной стройке'
                : 'Запустите цифровой контур управления'}
            </h1>
            <p className={primitiveAuthMarketingSubtextClassName}>
              {isSignIn
                ? 'Один доступ ко всем объектам, бригадам и поставкам. Войти и продолжить работу.'
                : 'Создайте команду, настройте роли и получайте контроль над сроками и бюджетом.'}
            </p>
          </div>

          <div className="grid gap-3 text-sm text-white/80 sm:grid-cols-2">
            <div className={primitiveAuthFeatureCardClassName}>
              <p className={primitiveAuthFeatureCardLabelClassName}>
                Безопасность
              </p>
              <p className={primitiveAuthFeatureCardValueClassName}>
                RBAC и аудит действий
              </p>
            </div>
            <div className={primitiveAuthFeatureCardClassName}>
              <p className={primitiveAuthFeatureCardLabelClassName}>
                Команды
              </p>
              <p className={primitiveAuthFeatureCardValueClassName}>
                Роли для всех участников
              </p>
            </div>
          </div>
        </section>

        <Card
          id="auth-card"
          className={`w-full ${primitiveAuthPanelBorderClassName} bg-card text-white ${primitiveAuthPanelShadowClassName}`}
        >
          <CardHeader className="text-left">
            <div className="flex items-center gap-3">
              <CircleIcon className="h-10 w-10 text-brand" aria-hidden="true" />
              <div>
                <CardTitle className={primitiveAuthFormTitleClassName}>
                  {formTitle}
                </CardTitle>
                <CardDescription className={primitiveAuthFormDescriptionClassName}>
                  {formSubtitle}{' '}
                  <Link
                    href={`${isSignIn ? '/sign-up' : '/sign-in'}?${new URLSearchParams({
                      ...(redirect ? { redirect } : {}),
                      ...(priceId ? { priceId } : {}),
                      ...(inviteId ? { inviteId } : {}),
                      ...(emailParam ? { email: emailParam } : {}),
                    }).toString()}`}
                    className="font-medium text-brand hover:text-brand/80"
                  >
                    {switchText}
                  </Link>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {verifiedState === 'required' && (
              <AuthStatusMessage variant="warning" className="mb-4">
                Подтвердите email перед входом. Мы отправили письмо со ссылкой для подтверждения.
              </AuthStatusMessage>
            )}
            <FormLayout className="space-y-4" action={formAction}>
              <HiddenInput name="redirect" value={redirect || ''} />
              <HiddenInput name="priceId" value={priceId || ''} />
              <HiddenInput name="inviteId" value={inviteId || ''} />
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  size="default"
                  autoComplete="email"
                  defaultValue={state?.email || emailParam || ''}
                  readOnly={!!inviteId && mode === 'signup'}
                  aria-readonly={!!inviteId && mode === 'signup'}
                  aria-invalid={!!state?.error}
                  required
                  maxLength={50}
                  placeholder="name@company.ru"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative [&_input]:pr-10">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    size="default"
                    autoComplete={
                      isSignIn ? 'current-password' : 'new-password'
                    }
                    defaultValue={state?.password}
                    required
                    minLength={8}
                    maxLength={100}
                    placeholder="Минимум 8 символов"
                    aria-describedby="password-hint"
                    aria-invalid={!!state?.error}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p id="password-hint" className="text-xs text-white/60">
                  Не менее 8 символов.
                </p>
              </div>

              {mode === 'signup' && !inviteId && (
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Название организации</Label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    size="default"
                    required={!inviteId}
                    maxLength={100}
                    placeholder="ООО «Северный бетон»"
                  />
                </div>
              )}

              {state?.error && (
                <AuthStatusMessage variant="error">
                  {state?.error}
                </AuthStatusMessage>
              )}

              <Button
                type="submit"
                variant="brand"
                size="default"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Проверяем...
                  </>
                ) : isSignIn ? (
                  'Войти'
                ) : (
                  'Создать аккаунт'
                )}
              </Button>

              {isSignIn && (
                <div className="text-center text-sm">
                  <Link
                    href="/forgot-password"
                    className="text-brand hover:text-brand/80"
                  >
                    Забыли пароль?
                  </Link>
                </div>
              )}
            </FormLayout>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
