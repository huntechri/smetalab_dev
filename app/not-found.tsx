import Link from 'next/link';

import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/states';

export default function NotFound() {
  return (
    <ErrorState
      title="Page Not Found"
      description="The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
      action={
        <Button variant="outline" size="default" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      }
    />
  );
}
