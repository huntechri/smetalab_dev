import * as React from 'react';

import { cn } from '@/lib/utils';
import { primitiveVisualTypographyClassNames } from '@/shared/ui/primitive-surface';

type DenseListStatProps = React.ComponentProps<'div'> & {
  label: string;
  valueTone?: 'default' | 'success';
};

const denseListStatValueClassName: Record<NonNullable<DenseListStatProps['valueTone']>, string> = {
  default: 'text-foreground',
  success: 'text-success',
};

function DenseListStat({
  label,
  valueTone = 'default',
  className,
  children,
  ...props
}: DenseListStatProps) {
  return (
    <div className={cn('text-right min-w-[60px] sm:min-w-[80px]', className)} {...props}>
      <p className={primitiveVisualTypographyClassNames.compactCaption}>{label}</p>
      <p className={cn('text-sm font-bold tabular-nums', denseListStatValueClassName[valueTone])}>
        {children}
      </p>
    </div>
  );
}

function DenseListSummaryRail({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-wrap justify-end gap-2 px-1 -mb-[14px]', className)} {...props} />;
}

export {
  DenseListStat,
  DenseListSummaryRail,
};
