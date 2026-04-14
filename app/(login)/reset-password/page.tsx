import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  return <ResetPasswordForm token={params.token ?? ''} />;
}
