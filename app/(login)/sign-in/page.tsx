import { Suspense } from 'react';
import { Login } from '@/features/auth/components/LoginForm';

export default function SignInPage() {
  return (
    <Suspense>
      <Login mode="signin" />
    </Suspense>
  );
}
