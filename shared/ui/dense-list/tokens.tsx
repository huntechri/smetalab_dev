import * as React from 'react';

import { cn } from '@/lib/utils';

type DenseListColorIndicatorProps = Omit<React.ComponentProps<'span'>, 'color'> & {
  color?: string | null;
};

export const denseListIndicatorClassName = 'size-2.5 shrink-0 rounded-full';
export const denseListMutedIndicatorClassName = `${denseListIndicatorClassName} bg-muted-foreground/40`;

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
};
