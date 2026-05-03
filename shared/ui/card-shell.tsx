import * as React from 'react';

import { cn } from '@/lib/utils';
import { Surface, type SurfaceProps, type SurfaceVariant } from '@/shared/ui/surface';
import {
  type PrimitiveCardShellDensity,
  primitiveCardShellGapClassNames,
  primitiveCardShellInsetDensityClassNames,
  primitiveCardShellHeaderDensityClassNames,
  primitiveCardShellBodyDensityClassNames,
  primitiveCardShellFooterDensityClassNames,
} from '@/shared/ui/primitive-density';

export type CardShellDensity = PrimitiveCardShellDensity;
export type CardShellVariant = Extract<SurfaceVariant, 'card' | 'panel' | 'glass' | 'muted' | 'subtle' | 'ghost'>;
export type CardShellInsetVariant = 'plain' | 'muted' | 'subtle';

const cardShellInsetVariantClassName: Record<CardShellInsetVariant, string> = {
  plain: '',
  muted: 'rounded-lg border border-border bg-muted/30',
  subtle: 'rounded-lg border border-border bg-muted/20',
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
      className={cn('flex flex-col', primitiveCardShellGapClassNames[density], className)}
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
      className={cn(cardShellInsetVariantClassName[variant], primitiveCardShellInsetDensityClassNames[density], className)}
      {...props}
    />
  );
}

export interface CardShellHeaderProps extends React.ComponentPropsWithoutRef<'div'> {
  density?: CardShellDensity;
}

export function CardShellHeader({ density = 'default', className, ...props }: CardShellHeaderProps) {
  return <div data-slot="card-shell-header" className={cn(primitiveCardShellHeaderDensityClassNames[density], className)} {...props} />;
}

export interface CardShellBodyProps extends React.ComponentPropsWithoutRef<'div'> {
  density?: CardShellDensity;
}

export function CardShellBody({ density = 'default', className, ...props }: CardShellBodyProps) {
  return <div data-slot="card-shell-body" className={cn(primitiveCardShellBodyDensityClassNames[density], className)} {...props} />;
}

export interface CardShellFooterProps extends React.ComponentPropsWithoutRef<'div'> {
  density?: CardShellDensity;
  divided?: boolean;
}

export function CardShellFooter({ density = 'default', divided = false, className, ...props }: CardShellFooterProps) {
  return (
    <div
      data-slot="card-shell-footer"
      className={cn(divided && 'border-t', primitiveCardShellFooterDensityClassNames[density], className)}
      {...props}
    />
  );
}
