import * as React from 'react';

import { cn } from '@/lib/utils';

type EditableDataSurfaceViewportSize = 'estimate' | 'default';

type EditableDataSurfaceViewportProps = React.ComponentProps<'div'> & {
  size?: EditableDataSurfaceViewportSize;
};

const editableDataSurfaceViewportSizeClassName: Record<EditableDataSurfaceViewportSize, string> = {
  estimate: 'max-h-96',
  default: 'max-h-96',
};

function EditableDataSurface({ className, ...props }: React.ComponentProps<'section'>) {
  return <section className={cn('flex flex-col rounded-lg border bg-card text-card-foreground shadow-none', className)} {...props} />;
}

function EditableDataSurfaceToolbar({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('px-2 pt-2', className)} {...props} />;
}

function EditableDataSurfaceViewport({ size = 'default', className, ...props }: EditableDataSurfaceViewportProps) {
  return <div className={cn('overflow-y-auto bg-card px-2 py-2 sm:px-4', editableDataSurfaceViewportSizeClassName[size], className)} {...props} />;
}

function EditableDataSurfaceEmptyInset({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('py-8', className)} {...props} />;
}

function EditableDataSurfaceActions({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-wrap items-center justify-center gap-2', className)} {...props} />;
}

export {
  EditableDataSurface,
  EditableDataSurfaceActions,
  EditableDataSurfaceEmptyInset,
  EditableDataSurfaceToolbar,
  EditableDataSurfaceViewport,
};
