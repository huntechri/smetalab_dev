import type { ComponentProps } from 'react';
import { Button } from '@/shared/ui/button';

interface LoadingButtonProps extends Omit<ComponentProps<typeof Button>, 'isLoading' | 'loadingText'> {
  isLoading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  isLoading = false,
  loadingText,
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || isLoading}
      isLoading={isLoading}
      loadingText={loadingText}
    >
      {children}
    </Button>
  );
}
