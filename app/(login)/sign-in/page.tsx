import { Suspense } from 'react';
import { Login } from '@/features/auth';

export default function SignInPage() {
  return (
    <Suspense>
      <Login mode="signin" />
    </Suspense>
  );
}
