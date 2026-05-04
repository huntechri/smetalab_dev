import * as React from 'react';

import { cn } from '@/lib/utils';

interface CatalogListItemProps extends React.ComponentProps<'div'> {
    /**
     * Whether the item is currently selected/active.
     */
    isSelected?: boolean;
}

/**
 * Shared list item surface used inside catalog pickers (Virtuoso and non-virtualized).
 * Provides the card-surface look with hover/transition/border animation.
 */
function CatalogListItem({ className, isSelected, children, ...props }: CatalogListItemProps) {
    return (
        <div
            data-slot="catalog-list-item"
            className={cn(
                'group relative flex items-center justify-between gap-3 p-2 sm:p-3 rounded-xl',
                'hover:bg-muted/40 transition-colors',
                'border border-border/30 sm:border-transparent',
                'hover:shadow-sm hover:border-border/60',
                'w-full overflow-hidden bg-background sm:bg-transparent',
                isSelected && 'border-primary/50 bg-primary/5',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export { CatalogListItem };
export type { CatalogListItemProps };
