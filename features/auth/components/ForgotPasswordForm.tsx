'use client';

import { useActionState } from 'react';
import Link from 'next/link';

import { requestPasswordReset } from '@/app/(login)/actions';
import { Button } from '@/shared/ui/button';
import { FormLayout } from '@/shared/ui/form-layout';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { ActionState } from '@/lib/infrastructure/auth/middleware';
import { AuthFormShell, AuthStatusMessage } from './AuthFormShell';

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    requestPasswordReset,
    {}
  );

  return (
    <AuthFormShell
      title="Восстановление пароля"
      description="Введите email, и мы отправим ссылку для сброса пароля."
    >
      <FormLayout action={formAction}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" size="default" required autoComplete="email" />
        </div>

        {state?.error ? (
          <AuthStatusMessage variant="error">{state.error}</AuthStatusMessage>
        ) : null}
        {state?.success ? (
          <AuthStatusMessage variant="success">{state.success}</AuthStatusMessage>
        ) : null}

        <Button type="submit" size="default" disabled={pending}>
          {pending ? 'Отправка...' : 'Отправить ссылку'}
        </Button>
        <Link
          href="/sign-in"
          className="block text-center text-sm text-muted-foreground hover:underline"
        >
          Вернуться ко входу
        </Link>
      </FormLayout>
    </AuthFormShell>
  );
}
