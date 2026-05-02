import * as React from 'react';

import { cn } from '@/lib/utils';

type ToolbarVariant = 'plain' | 'surface' | 'inset';
type ToolbarResponsive = 'stack' | 'nowrap' | 'wrap';
type ToolbarAlign = 'start' | 'end' | 'between';
type ToolbarGroupAlign = 'start' | 'end' | 'between';

const toolbarVariantClassName: Record<ToolbarVariant, string> = {
  plain: 'px-1 md:px-0',
  surface: 'border-b bg-background/95 p-3 shadow-sm backdrop-blur-sm sm:px-4',
  inset: 'p-1.5 pb-0 sm:p-2',
};

const toolbarResponsiveClassName: Record<ToolbarResponsive, string> = {
  stack: 'flex flex-col gap-3 xl:flex-row xl:items-center',
  nowrap: 'flex flex-row items-center gap-2',
  wrap: 'flex flex-wrap items-center gap-2',
};

const toolbarAlignClassName: Record<ToolbarAlign, string> = {
  start: 'justify-start',
  end: 'justify-end',
  between: 'justify-between',
};

const toolbarGroupAlignClassName: Record<ToolbarGroupAlign, string> = {
  start: 'justify-start',
  end: 'justify-end',
  between: 'justify-between',
};

type ToolbarProps = React.ComponentProps<'div'> & {
  variant?: ToolbarVariant;
  responsive?: ToolbarResponsive;
  align?: ToolbarAlign;
};

type ToolbarGroupProps = React.ComponentProps<'div'> & {
  align?: ToolbarGroupAlign;
  grow?: boolean;
  scroll?: boolean;
  fullWidthOnMobile?: boolean;
};

type ToolbarActionGroupProps = ToolbarGroupProps & {
  label?: string;
};

function Toolbar({
  variant = 'plain',
  responsive = 'stack',
  align = 'between',
  className,
  ...props
}: ToolbarProps) {
  return (
    <div
      className={cn(
        toolbarVariantClassName[variant],
        toolbarResponsiveClassName[responsive],
        toolbarAlignClassName[align],
        className,
      )}
      {...props}
    />
  );
}

function ToolbarGroup({
  align = 'start',
  grow = false,
  scroll = false,
  fullWidthOnMobile = false,
  className,
  ...props
}: ToolbarGroupProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2',
        toolbarGroupAlignClassName[align],
        grow && 'flex-1',
        fullWidthOnMobile && 'w-full sm:w-auto',
        scroll && 'overflow-x-auto pb-1 scrollbar-hide sm:pb-0',
        className,
      )}
      {...props}
    />
  );
}

function ToolbarActionGroup({
  label = 'Действия',
  align = 'end',
  scroll = true,
  ...props
}: ToolbarActionGroupProps) {
  return (
    <ToolbarGroup
      role="group"
      aria-label={label}
      align={align}
      scroll={scroll}
      {...props}
    />
  );
}

function ToolbarDivider({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('mx-1 hidden h-6 w-px bg-border xl:block', className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export {
  Toolbar,
  ToolbarActionGroup,
  ToolbarDivider,
  ToolbarGroup,
};
export type {
  ToolbarActionGroupProps,
  ToolbarGroupProps,
  ToolbarProps,
};
