'use client';

import { useActionState } from 'react';
import Link from 'next/link';

import { resetPasswordWithToken } from '@/app/(login)/actions';
import { Button } from '@/shared/ui/button';
import { FormLayout } from '@/shared/ui/form-layout';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { ActionState } from '@/lib/infrastructure/auth/middleware';
import { AuthFormShell, AuthStatusMessage } from './AuthFormShell';

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    resetPasswordWithToken,
    {}
  );

  return (
    <AuthFormShell
      title="Новый пароль"
      description="Введите новый пароль для аккаунта."
    >
      <FormLayout action={formAction}>
        <Input type="hidden" name="token" value={token} />
        <div className="space-y-2">
          <Label htmlFor="password">Новый пароль</Label>
          <Input
            id="password"
            name="password"
            type="password"
            size="default"
            required
            minLength={8}
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            size="default"
            required
            minLength={8}
            maxLength={100}
          />
        </div>

        {state?.error ? (
          <AuthStatusMessage variant="error">{state.error}</AuthStatusMessage>
        ) : null}
        {state?.success ? (
          <AuthStatusMessage variant="success">{state.success}</AuthStatusMessage>
        ) : null}

        <Button type="submit" size="default" disabled={pending || !token}>
          {pending ? 'Сохраняем...' : 'Обновить пароль'}
        </Button>
        <Link
          href="/sign-in"
          className="block text-center text-sm text-muted-foreground hover:underline"
        >
          Перейти ко входу
        </Link>
      </FormLayout>
    </AuthFormShell>
  );
}
