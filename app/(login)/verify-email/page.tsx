import Link from 'next/link';
import { verifyEmail } from '@/app/(login)/actions';

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  const formData = new FormData();
  formData.set('token', params.token ?? '');
  const result = await verifyEmail(undefined, formData);
  const hasError = typeof result === 'object' && result !== null && 'error' in result && typeof result.error === 'string';

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md items-center px-4">
      <div className="w-full rounded-xl border p-6 text-center">
        {hasError ? <p className="text-red-500">{result.error as string}</p> : <p className="text-green-600">Email подтвержден. Теперь можно войти.</p>}
        <Link href="/sign-in" className="mt-4 inline-block text-sm text-muted-foreground hover:underline">Перейти ко входу</Link>
      </div>
    </main>
  );
}
