'use client';

import type { ReactNode } from 'react';

import {
  ScrollArea,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@repo/ui';

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
  contentClassName = 'w-full sm:max-w-[540px] max-h-dvh flex flex-col p-0',
  bodyClassName = 'px-4 pb-4 sm:px-6 sm:pb-6 space-y-4 sm:space-y-4',
}: DirectoryEntitySheetShellProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={contentClassName}>
        <SheetHeader className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
          <SheetTitle className="text-base sm:text-lg">{title}</SheetTitle>
          <SheetDescription className="text-xs sm:text-sm">
            {description}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className={bodyClassName}>{children}</div>
        </ScrollArea>

        <div className="px-4 py-3 sm:p-6 border-t bg-muted/20">
          <SheetFooter className="flex-row gap-2 sm:space-x-0">
            {footer}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
