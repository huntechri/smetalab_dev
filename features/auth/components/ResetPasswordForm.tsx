'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { resetPasswordWithToken } from '@/app/(login)/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { ActionState } from '@/lib/infrastructure/auth/middleware';

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(resetPasswordWithToken, {});

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Новый пароль</CardTitle>
          <CardDescription>Введите новый пароль для аккаунта.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            <div className="space-y-2"><Label htmlFor="password">Новый пароль</Label><Input id="password" name="password" type="password" required minLength={8} maxLength={100} /></div>
            <div className="space-y-2"><Label htmlFor="confirmPassword">Подтверждение пароля</Label><Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} maxLength={100} /></div>
            {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
            {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
            <Button type="submit" disabled={pending || !token}>{pending ? 'Сохраняем...' : 'Обновить пароль'}</Button>
            <Link href="/sign-in" className="block text-center text-sm text-muted-foreground hover:underline">Перейти ко входу</Link>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
