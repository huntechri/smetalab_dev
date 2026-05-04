'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import {
  primitiveAppHeaderClassName,
  primitiveAppHeaderInnerClassName,
} from '@/shared/ui/primitive-navigation';

export function AppHeaderShell({ className, children, ...props }: React.ComponentPropsWithoutRef<'header'>) {
  return (
    <header
      data-slot="app-header"
      className={cn(primitiveAppHeaderClassName, primitiveAppHeaderInnerClassName, className)}
      {...props}
    >
      {children}
    </header>
  );
}
