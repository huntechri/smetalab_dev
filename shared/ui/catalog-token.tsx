import * as React from 'react';
import { Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';
import { primitiveCatalogDensePaddingClassName, primitiveCatalogIndexTokenTextClassName } from '@/shared/ui/primitive-badge'
import { primitiveCatalogTokenCompactTextClassName, primitiveCatalogTokenTextClassName } from '@/shared/ui/primitive-badge';

type CatalogTokenTone = 'code' | 'category';
type CatalogTokenDensity = 'default' | 'compact';

type CatalogTokenProps = React.ComponentProps<'span'> & {
  tone?: CatalogTokenTone;
  density?: CatalogTokenDensity;
};

type CatalogIndexTokenProps = React.ComponentProps<'span'>;

type CatalogAiModeIndicatorProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  active?: boolean;
};

const catalogTokenToneClassName: Record<CatalogTokenTone, string> = {
  code: 'font-mono uppercase tracking-tight',
  category: 'truncate tracking-normal',
};

const catalogTokenDensityClassName: Record<CatalogTokenDensity, string> = {
  default: `px-1.5 ${primitiveCatalogTokenTextClassName}`,
  compact: `${primitiveCatalogDensePaddingClassName} ${primitiveCatalogTokenCompactTextClassName}`,
};

const catalogTokenSurfaceClassName: Record<CatalogTokenTone, Record<CatalogTokenDensity, string>> = {
  code: {
    default: 'border-border/40 bg-muted/60',
    compact: 'border-transparent bg-muted/80',
  },
  category: {
    default: 'border-border/20 bg-muted/30',
    compact: 'border-transparent bg-muted/50',
  },
};

function CatalogToken({
  tone = 'category',
  density = 'default',
  className,
  children,
  ...props
}: CatalogTokenProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full shrink-0 items-center rounded border py-0.5 font-medium leading-none text-muted-foreground',
        catalogTokenToneClassName[tone],
        catalogTokenDensityClassName[density],
        catalogTokenSurfaceClassName[tone][density],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

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

export { CatalogAiModeIndicator, CatalogIndexToken, CatalogToken };
