import * as React from 'react';

import { cn } from '@/lib/utils';
import {
  primitivePageShellContainerWidthClassName,
  primitivePageShellInnerPaddingClassName,
} from '@/shared/ui/primitive-density';

export type PageShellDensity = 'compact' | 'default' | 'comfortable';
export type PageShellWidth = 'default' | 'wide' | 'full';
export type PageShellSpacing = 'default' | 'compact' | 'flush-bottom';

const legacyPageShellClassName: Record<PageShellDensity, string> = {
  compact: 'space-y-2',
  default: 'space-y-3',
  comfortable: 'space-y-4',
};

const pageShellWidthClassName: Record<PageShellWidth, string> = {
  default: 'max-w-7xl',
  wide: primitivePageShellContainerWidthClassName,
  full: 'max-w-none',
};

const pageShellSpacingClassName: Record<PageShellSpacing, string> = {
  default: 'space-y-6 py-4',
  compact: 'space-y-3 pt-0.5 pb-4',
  'flush-bottom': 'space-y-4 pt-1 pb-0 -mb-4 md:-mb-6 lg:-mb-8',
};

export interface ContentContainerProps extends React.ComponentPropsWithoutRef<'div'> {
  width?: PageShellWidth;
}

export function ContentContainer({ width = 'default', className, ...props }: ContentContainerProps) {
  return (
    <div
      data-slot="content-container"
      className={cn('mx-auto w-full', pageShellWidthClassName[width], className)}
      {...props}
    />
  );
}

export interface PageHeaderProps extends Omit<React.ComponentPropsWithoutRef<'header'>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  titleAs?: 'h1' | 'h2';
}

export function PageHeader({
  title,
  description,
  actions,
  titleAs = 'h1',
  className,
  ...props
}: PageHeaderProps) {
  if (!title && !description && !actions) {
    return null;
  }

  const Title = titleAs;

  return (
    <header
      data-slot="page-header"
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4',
        className,
      )}
      {...props}
    >
      <div className="min-w-0 space-y-1">
        {title ? (
          <Title className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">
            {title}
          </Title>
        ) : null}
        {description ? (
          <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export interface PageShellProps extends Omit<React.ComponentPropsWithoutRef<'section'>, 'title'> {
  density?: PageShellDensity;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  width?: PageShellWidth;
  spacing?: PageShellSpacing;
  titleAs?: 'h1' | 'h2';
  visuallyHiddenTitle?: boolean;
}

export function PageShell({
  density,
  title,
  description,
  actions,
  width,
  spacing,
  titleAs = 'h1',
  visuallyHiddenTitle = false,
  children,
  className,
  ...props
}: PageShellProps) {
  if (!title && !description && !actions && !width && !spacing && !visuallyHiddenTitle) {
    return (
      <section
        data-slot="page-shell"
        className={cn(legacyPageShellClassName[density ?? 'default'], className)}
        {...props}
      >
        {children}
      </section>
    );
  }

  return (
    <section data-slot="page-shell" className={cn('min-w-0', className)} {...props}>
      <ContentContainer
        width={width ?? 'wide'}
        className={pageShellSpacingClassName[spacing ?? 'default']}
      >
        {visuallyHiddenTitle && title ? <h1 className="sr-only">{title}</h1> : null}
        {!visuallyHiddenTitle ? (
          <PageHeader
            title={title}
            description={description}
            actions={actions}
            titleAs={titleAs}
          />
        ) : null}
        {children}
      </ContentContainer>
    </section>
  );
}

export type WorkspaceMainProps = React.ComponentPropsWithoutRef<'main'>;

export function WorkspaceMain({ className, ...props }: WorkspaceMainProps) {
  return (
    <main
      id="main"
      data-slot="workspace-main"
      className={cn(`min-w-0 flex-1 ${primitivePageShellInnerPaddingClassName}`, className)}
      {...props}
    />
  );
}
