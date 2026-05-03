import * as React from 'react';

import { Badge } from '@/shared/ui/badge';
import { cn } from '@/lib/utils';

type DenseListTokenProps = Omit<React.ComponentProps<typeof Badge>, 'size'>;

type DenseListColorIndicatorProps = Omit<React.ComponentProps<'span'>, 'color'> & {
  color?: string | null;
};

export const denseListIndicatorClassName = 'size-2.5 shrink-0 rounded-full';
export const denseListMutedIndicatorClassName = `${denseListIndicatorClassName} bg-muted-foreground/40`;

function DenseListToken({ className, children, ...props }: DenseListTokenProps) {
  return (
    <Badge size="xs" className={cn('shrink-0 normal-case tracking-normal', className)} {...props}>
      {children}
    </Badge>
  );
}

function DenseListColorIndicator({ color, className, style, ...props }: DenseListColorIndicatorProps) {
  return (
    <span
      className={cn(color ? denseListIndicatorClassName : denseListMutedIndicatorClassName, className)}
      style={color ? { ...style, backgroundColor: color } : style}
      aria-hidden="true"
      {...props}
    />
  );
}

export {
  DenseListColorIndicator,
  DenseListToken,
};
