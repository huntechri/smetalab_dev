import * as React from 'react';

import { cn } from '@/lib/utils';

export type SectionDensity = 'compact' | 'default' | 'comfortable';

const sectionGapClassName: Record<SectionDensity, string> = {
  compact: 'space-y-2',
  default: 'space-y-3',
  comfortable: 'space-y-4',
};

export interface SectionProps extends React.ComponentPropsWithoutRef<'section'> {
  density?: SectionDensity;
}

export function Section({ density = 'default', className, ...props }: SectionProps) {
  return <section className={cn(sectionGapClassName[density], className)} {...props} />;
}

export interface SectionHeaderProps extends React.ComponentPropsWithoutRef<'div'> {
  align?: 'start' | 'between';
}

export function SectionHeader({ align = 'start', className, ...props }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        align === 'between' && 'flex items-center justify-between gap-3',
        align === 'start' && 'flex flex-col gap-1',
        className,
      )}
      {...props}
    />
  );
}

export function SectionTitle({ className, ...props }: React.ComponentPropsWithoutRef<'h2'>) {
  return <h2 className={cn('text-lg font-semibold tracking-tight', className)} {...props} />;
}
