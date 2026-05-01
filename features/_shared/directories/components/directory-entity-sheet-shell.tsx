'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { directoryEntitySheetClassNames } from '@/shared/ui/shells/catalog-directory-visual-contracts';
import { ScrollArea } from '@/shared/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet';

interface DirectoryEntitySheetShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  contentClassName?: string;
  bodyClassName?: string;
}

export function DirectoryEntitySheetShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  contentClassName,
  bodyClassName,
}: DirectoryEntitySheetShellProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn(directoryEntitySheetClassNames.content, contentClassName)}>
        <SheetHeader className={directoryEntitySheetClassNames.header}>
          <SheetTitle className={directoryEntitySheetClassNames.title}>{title}</SheetTitle>
          <SheetDescription className={directoryEntitySheetClassNames.description}>
            {description}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className={directoryEntitySheetClassNames.scrollArea}>
          <div className={cn(directoryEntitySheetClassNames.body, bodyClassName)}>{children}</div>
        </ScrollArea>

        <div className={directoryEntitySheetClassNames.footerFrame}>
          <SheetFooter className={directoryEntitySheetClassNames.footer}>
            {footer}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
