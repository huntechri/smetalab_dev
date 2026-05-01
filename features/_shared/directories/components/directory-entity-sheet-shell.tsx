'use client';

import type { ReactNode } from 'react';

import { ScrollArea } from '@/shared/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet';
import { cn } from '@/lib/utils';

const directorySheetContentClassName = 'flex max-h-dvh w-full flex-col p-0 sm:max-w-[540px]';
const directorySheetHeaderClassName = 'px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6';
const directorySheetTitleClassName = 'text-base sm:text-lg';
const directorySheetDescriptionClassName = 'text-xs sm:text-sm';
const directorySheetBodyClassName = 'space-y-4 px-4 pb-4 sm:px-6 sm:pb-6';
const directorySheetFooterFrameClassName = 'border-t bg-muted/20 px-4 py-3 sm:p-6';
const directorySheetFooterClassName = 'flex-row gap-2 sm:space-x-0';

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
      <SheetContent className={cn(directorySheetContentClassName, contentClassName)}>
        <SheetHeader className={directorySheetHeaderClassName}>
          <SheetTitle className={directorySheetTitleClassName}>{title}</SheetTitle>
          <SheetDescription className={directorySheetDescriptionClassName}>
            {description}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className={cn(directorySheetBodyClassName, bodyClassName)}>{children}</div>
        </ScrollArea>

        <div className={directorySheetFooterFrameClassName}>
          <SheetFooter className={directorySheetFooterClassName}>
            {footer}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
