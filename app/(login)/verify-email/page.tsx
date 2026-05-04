import Link from 'next/link';

import { verifyEmail } from '@/app/(login)/actions';
import { Button } from '@/shared/ui/button';
import { AuthShell, AuthPanel, AuthStatusMessage } from '@/shared/ui/auth-shell';

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
    <AuthShell>
      <AuthPanel className="p-8 text-center">
        <h1 className="mb-6 text-2xl font-semibold">Подтверждение email</h1>
        <div className="space-y-4">
          {hasError ? (
            <AuthStatusMessage variant="error">
              {result.error as string}
            </AuthStatusMessage>
          ) : (
            <AuthStatusMessage variant="success">
              Email подтвержден. Теперь можно войти.
            </AuthStatusMessage>
          )}
          <Button variant="outline" size="default" asChild>
            <Link href="/sign-in">Перейти ко входу</Link>
          </Button>
        </div>
      </AuthPanel>
    </AuthShell>
  );
}
