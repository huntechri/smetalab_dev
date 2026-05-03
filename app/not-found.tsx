import Link from 'next/link';
import { CircleIcon } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { StateShell } from '@/shared/ui/states';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8 text-foreground">
      <StateShell>
        <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
            <CircleIcon className="size-6" aria-hidden="true" />
          </div>
          <CardTitle className="text-3xl tracking-tight">Page Not Found</CardTitle>
          <CardDescription>
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="xs" variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
        </Card>
      </StateShell>
    </main>
  );
}
