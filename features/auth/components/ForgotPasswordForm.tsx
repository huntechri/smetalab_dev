'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/app/(login)/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Button } from '@/components/ui/button';
import { ActionState } from '@/lib/infrastructure/auth/middleware';

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(requestPasswordReset, {});

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Восстановление пароля</CardTitle>
          <CardDescription>Введите email, и мы отправим ссылку для сброса пароля.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
            {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
            <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Отправка...' : 'Отправить ссылку'}</Button>
            <Link href="/sign-in" className="block text-center text-sm text-muted-foreground hover:underline">Вернуться ко входу</Link>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
