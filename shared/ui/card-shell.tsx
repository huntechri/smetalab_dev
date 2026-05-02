import * as React from 'react';

import { cn } from '@/lib/utils';
import { Surface, type SurfaceDensity, type SurfaceProps, type SurfaceVariant } from '@/shared/ui/surface';

export type CardShellDensity = Extract<SurfaceDensity, 'compact' | 'default' | 'comfortable'>;
export type CardShellVariant = Extract<SurfaceVariant, 'card' | 'panel' | 'glass' | 'muted' | 'subtle' | 'ghost'>;
export type CardShellInsetVariant = 'plain' | 'muted' | 'subtle';

const cardShellGapClassName: Record<CardShellDensity, string> = {
  compact: 'gap-3',
  default: 'gap-4',
  comfortable: 'gap-5',
};

const cardShellInsetClassName: Record<CardShellDensity, string> = {
  compact: 'px-3 py-2',
  default: 'p-3 sm:p-4',
  comfortable: 'p-4 sm:p-5',
};

const cardShellInsetVariantClassName: Record<CardShellInsetVariant, string> = {
  plain: '',
  muted: 'rounded-lg border border-border bg-muted/30',
  subtle: 'rounded-lg border border-border bg-muted/20',
};

const cardShellHeaderClassName: Record<CardShellDensity, string> = {
  compact: 'px-3 pt-3 sm:px-4 sm:pt-4',
  default: 'px-4 pt-4 sm:px-5 sm:pt-5',
  comfortable: 'px-4 pt-4 sm:px-6 sm:pt-6',
};

const cardShellBodyClassName: Record<CardShellDensity, string> = {
  compact: 'p-3 sm:p-4',
  default: 'p-4 sm:p-5',
  comfortable: 'p-4 sm:p-6',
};

const cardShellFooterClassName: Record<CardShellDensity, string> = {
  compact: 'px-3 py-3 sm:px-4',
  default: 'px-4 py-4 sm:px-5',
  comfortable: 'px-4 py-4 sm:px-6',
};

export interface CardShellProps extends Omit<SurfaceProps, 'density' | 'variant'> {
  density?: CardShellDensity;
  variant?: CardShellVariant;
}

export function CardShell({
  density = 'default',
  variant = 'card',
  className,
  children,
  ...props
}: CardShellProps) {
  return (
    <Surface
      data-slot="card-shell"
      variant={variant}
      density="none"
      overflow="hidden"
      className={cn('flex flex-col', cardShellGapClassName[density], className)}
      {...props}
    >
      {children}
    </Surface>
  );
}

export interface CardShellInsetProps extends React.ComponentPropsWithoutRef<'div'> {
  density?: CardShellDensity;
  variant?: CardShellInsetVariant;
}

export function CardShellInset({ density = 'default', variant = 'plain', className, ...props }: CardShellInsetProps) {
  return (
    <div
      data-slot="card-shell-inset"
      className={cn(cardShellInsetVariantClassName[variant], cardShellInsetClassName[density], className)}
      {...props}
    />
  );
}

export interface CardShellHeaderProps extends React.ComponentPropsWithoutRef<'div'> {
  density?: CardShellDensity;
}

export function CardShellHeader({ density = 'default', className, ...props }: CardShellHeaderProps) {
  return <div data-slot="card-shell-header" className={cn(cardShellHeaderClassName[density], className)} {...props} />;
}

export interface CardShellBodyProps extends React.ComponentPropsWithoutRef<'div'> {
  density?: CardShellDensity;
}

export function CardShellBody({ density = 'default', className, ...props }: CardShellBodyProps) {
  return <div data-slot="card-shell-body" className={cn(cardShellBodyClassName[density], className)} {...props} />;
}

export interface CardShellFooterProps extends React.ComponentPropsWithoutRef<'div'> {
  density?: CardShellDensity;
  divided?: boolean;
}

export function CardShellFooter({ density = 'default', divided = false, className, ...props }: CardShellFooterProps) {
  return (
    <div
      data-slot="card-shell-footer"
      className={cn(divided && 'border-t', cardShellFooterClassName[density], className)}
      {...props}
    />
  );
}
