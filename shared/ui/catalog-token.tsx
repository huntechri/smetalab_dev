import * as React from 'react';
import { Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';
import { primitiveCatalogIndexTokenTextClassName } from '@/shared/ui/primitive-badge';

type CatalogIndexTokenProps = React.ComponentProps<'span'>;

type CatalogAiModeIndicatorProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  active?: boolean;
};

function CatalogIndexToken({ className, children, ...props }: CatalogIndexTokenProps) {
  return (
    <span
      className={cn(
        `inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted ${primitiveCatalogIndexTokenTextClassName} font-mono text-muted-foreground`,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

function CatalogAiModeIndicator({ active = false, className, ...props }: CatalogAiModeIndicatorProps) {
  return (
    <div
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300',
        active ? 'animate-pulse bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
        className,
      )}
      {...props}
    >
      <Sparkles className="h-4 w-4" />
    </div>
  );
}

export { CatalogAiModeIndicator, CatalogIndexToken };
