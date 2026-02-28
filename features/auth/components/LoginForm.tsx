'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp } from '@/app/(login)/actions';
import { ActionState } from '@/lib/infrastructure/auth/middleware';

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
    <div className="min-h-[100dvh] bg-[#0B0A0F] text-white">
      <a href="#auth-card" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-black">
        Пропустить к форме входа
      </a>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[120px] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(255,106,61,0.35),rgba(11,10,15,0))] blur-3xl" />
        <div className="absolute right-[-160px] bottom-[140px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(127,255,212,0.2),rgba(11,10,15,0))] blur-3xl" />
      </div>

      <main className="relative mx-auto grid min-h-[100dvh] w-full max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF6A3D] text-black font-bold">
              S
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">Smetalab</p>
              <p className="text-sm font-semibold">BuildOS</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">
              {isSignIn ? 'Client access' : 'Start building'}
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              {isSignIn
                ? 'Возвращайтесь к прозрачной стройке'
                : 'Запустите цифровой контур управления'}
            </h1>
            <p className="max-w-lg text-lg text-white/80">
              {isSignIn
                ? 'Один доступ ко всем объектам, бригадам и поставкам. Войти и продолжить работу.'
                : 'Создайте команду, настройте роли и получайте контроль над сроками и бюджетом.'}
            </p>
          </div>

          <div className="grid gap-3 text-sm text-white/80 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">Безопасность</p>
              <p className="mt-2 font-semibold">RBAC и аудит действий</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">Команды</p>
              <p className="mt-2 font-semibold">Роли для всех участников</p>
            </div>
          </div>
        </section>

        <Card id="auth-card" className="w-full border-white/10 bg-[#14121A] text-white shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
          <CardHeader className="text-left">
            <div className="flex items-center gap-3">
              <CircleIcon className="h-10 w-10 text-[#FF6A3D]" aria-hidden="true" />
              <div>
                <CardTitle className="text-2xl font-semibold text-white">
                  {formTitle}
                </CardTitle>
                <CardDescription className="text-white/70">
                  {formSubtitle}{' '}
                  <Link
                    href={`${isSignIn ? '/sign-up' : '/sign-in'}?${new URLSearchParams({
                      ...(redirect ? { redirect } : {}),
                      ...(priceId ? { priceId } : {}),
                      ...(inviteId ? { inviteId } : {}),
                      ...(emailParam ? { email: emailParam } : {}),
                    }).toString()}`}
                    className="font-medium text-[#FF6A3D] hover:text-[#FF865F]"
                  >
                    {switchText}
                  </Link>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {verifiedState === 'required' && (
              <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                Подтвердите email перед входом. Мы отправили письмо со ссылкой для подтверждения.
              </div>
            )}
            <form className="space-y-6" action={formAction}>
            <input type="hidden" name="redirect" value={redirect || ''} />
            <input type="hidden" name="priceId" value={priceId || ''} />
            <input type="hidden" name="inviteId" value={inviteId || ''} />
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state?.email || emailParam || ''}
                readOnly={!!inviteId && mode === 'signup'}
                aria-readonly={!!inviteId && mode === 'signup'}
                aria-invalid={!!state?.error}
                required
                maxLength={50}
                placeholder="name@company.ru"
                className={`${!!inviteId && mode === 'signup'
                  ? 'bg-gray-100 cursor-not-allowed'
                  : ''
                  }`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
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
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 rounded-sm text-white/70 hover:bg-transparent hover:text-white focus-visible:ring-white/60 focus-visible:ring-offset-[#14121A]"
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
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
                  required={!inviteId}
                  maxLength={100}
                  placeholder="ООО «Северный бетон»"
                />
              </div>
            )}

            {state?.error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert" aria-live="polite">
                {state?.error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#FF6A3D] text-black hover:bg-[#FF865F]"
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
                <Link href="/forgot-password" className="text-[#FF6A3D] hover:text-[#FF865F]">
                  Забыли пароль?
                </Link>
              </div>
            )}
          </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
