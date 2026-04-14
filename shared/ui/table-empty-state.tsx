'use client';

import * as React from 'react';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from '@/shared/ui/empty';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface TableEmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function TableEmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: TableEmptyStateProps) {
  return (
    <Empty className={cn('min-h-[300px] border-none shadow-none', className)}>
      <EmptyContent>
        {Icon && (
          <EmptyMedia variant="icon">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </EmptyMedia>
        )}
        <EmptyHeader>
          <EmptyTitle className="text-[16px] font-semibold text-foreground/80">{title}</EmptyTitle>
          {description && (
            <EmptyDescription className="text-muted-foreground/70 text-[13px]">
              {description}
            </EmptyDescription>
          )}
        </EmptyHeader>
        {action && <div className="mt-2">{action}</div>}
      </EmptyContent>
    </Empty>
  );
}
