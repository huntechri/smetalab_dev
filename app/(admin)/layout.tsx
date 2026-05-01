import Link from 'next/link';
import { Suspense } from 'react';
import { CircleIcon } from 'lucide-react';

import { AdminPublicHeader } from '@/shared/ui/admin-surface';
import { AdminUserMenu } from '@/features/admin';

function Header() {
  return (
    <AdminPublicHeader
      brand={(
        <Link href="/">
          <CircleIcon aria-hidden="true" />
          <span>Smetalab</span>
        </Link>
      )}
      actions={(
        <Suspense fallback={<div aria-hidden="true" />}>
          <AdminUserMenu />
        </Suspense>
      )}
    />
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex min-h-screen flex-col">
      <Header />
      {children}
    </section>
  );
}
