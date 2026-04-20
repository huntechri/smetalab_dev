import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'block' | 'fullscreen';
  showLabel?: boolean;
  className?: string;
}

const sizeMap: Record<NonNullable<LoadingIndicatorProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function LoadingIndicator({
  label = 'Загрузка...',
  size = 'md',
  variant = 'block',
  showLabel = true,
  className,
}: LoadingIndicatorProps) {
  const containerClassName = cn(
    variant === 'inline' && 'flex items-center gap-2',
    variant === 'block' && 'flex flex-col items-center gap-2',
    variant === 'fullscreen' && 'flex h-full min-h-[200px] items-center justify-center',
    className,
  );

  const contentClassName = cn(
    variant === 'fullscreen' && 'flex flex-col items-center gap-2',
  );

  return (
    <div className={containerClassName}>
      <div className={contentClassName}>
        <Loader2 className={cn('animate-spin text-muted-foreground', sizeMap[size])} />
        {showLabel && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
