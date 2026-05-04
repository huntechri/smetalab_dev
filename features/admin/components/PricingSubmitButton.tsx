'use client';

import { Button } from '@/shared/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export function PricingSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      variant="outline"
      size="default"
    >
      {pending ? (
        <>
          <Loader2 />
          Loading...
        </>
      ) : (
        <>
          Get Started
          <ArrowRight />
        </>
      )}
    </Button>
  );
}
