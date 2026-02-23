import { ResetPasswordForm } from './reset-form';

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  return <ResetPasswordForm token={params.token ?? ''} />;
}
