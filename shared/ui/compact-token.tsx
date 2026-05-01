import * as React from 'react';

import { Badge } from '@/shared/ui/badge';
import { cn } from '@/lib/utils';

type CompactTokenProps = Omit<React.ComponentProps<typeof Badge>, 'size'>;

export function CompactToken({ className, children, ...props }: CompactTokenProps) {
  return (
    <Badge
      size="xs"
      className={cn('shrink-0 normal-case tracking-normal', className)}
      {...props}
    >
      {children}
    </Badge>
  );
}
