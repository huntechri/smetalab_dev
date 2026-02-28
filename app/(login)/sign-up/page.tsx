import { Suspense } from 'react';
import { Login } from '@/features/auth/components/LoginForm';

export default function SignUpPage() {
  return (
    <Suspense>
      <Login mode="signup" />
    </Suspense>
  );
}
