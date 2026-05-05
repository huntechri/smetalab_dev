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

export const denseListPickerPopoverClassName = [
  'w-[min(20rem,calc(100vw-2rem))]',
  'p-0',
].join(' ');
export const denseListCalendarPopoverClassName = 'w-auto p-0';

function DenseListPickerButton({ maxWidth = 'default', className, ...props }: DenseListPickerButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="xs"
      className={cn(
        'rounded-full',
        denseListPickerButtonMaxWidthClassName[maxWidth],
        className,
      )}
      {...props}
    />
  );
}

export { DenseListPickerButton };
