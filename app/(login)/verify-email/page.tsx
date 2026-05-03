import Link from 'next/link';

import { verifyEmail } from '@/app/(login)/actions';
import { Button } from '@/shared/ui/button';
import { AuthFormShell, AuthStatusMessage } from '@/features/auth/components/AuthFormShell';
import { ErrorState } from '@/shared/ui/states';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const formData = new FormData();
  formData.set('token', params.token ?? '');
  const result = await verifyEmail(undefined, formData);
  const hasError =
    typeof result === 'object' &&
    result !== null &&
    'error' in result &&
    typeof result.error === 'string';

  return (
    <AuthFormShell title="Подтверждение email" align="center">
      <div className="space-y-4 text-center">
        {hasError ? (
          <ErrorState
            title="Не удалось подтвердить email"
            description={result.error as string}
            density="compact"
          />
        ) : (
          <AuthStatusMessage variant="success">
            Email подтвержден. Теперь можно войти.
          </AuthStatusMessage>
        )}
        <Button size="xs" variant="outline" asChild>
          <Link href="/sign-in">Перейти ко входу</Link>
        </Button>
      </div>
    </AuthFormShell>
  );
}
