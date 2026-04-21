import { Suspense } from 'react';
import { Login } from '@/features/auth';

export default function SignUpPage() {
  return (
    <Suspense>
      <Login mode="signup" />
    </Suspense>
  );
}
