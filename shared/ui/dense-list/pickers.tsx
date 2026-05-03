import * as React from 'react';

import { Button, type ButtonProps } from '@/shared/ui/button';
import { cn } from '@/lib/utils';

type DenseListPickerButtonMaxWidth = 'default' | 'project';

type DenseListPickerButtonProps = ButtonProps & {
  maxWidth?: DenseListPickerButtonMaxWidth;
};

const denseListPickerButtonMaxWidthClassName: Record<DenseListPickerButtonMaxWidth, string> = {
  default: 'max-w-full',
  project: 'max-w-[14rem] sm:max-w-[12rem]',
};

export const denseListPickerPopoverClassName = 'w-80 max-w-[calc(100vw-2rem)] p-0';
export const denseListCalendarPopoverClassName = 'w-auto p-0';

function DenseListPickerButton({ maxWidth = 'default', className, ...props }: DenseListPickerButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      className={cn(
        'h-6 justify-start gap-1 rounded-full border border-border bg-muted px-1.5 text-[11px] font-semibold text-foreground hover:bg-muted/80 sm:h-5 sm:text-[10px]',
        denseListPickerButtonMaxWidthClassName[maxWidth],
        className,
      )}
      {...props}
    />
  );
}

export { DenseListPickerButton };
