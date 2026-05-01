'use client';

import * as React from 'react';

import { Skeleton } from '@/shared/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { cn } from '@/lib/utils';

type WorkspaceTabsFallbackSize = 'panel' | 'compact';

const workspaceTabsFallbackSizeClassName: Record<WorkspaceTabsFallbackSize, string> = {
  panel: 'h-96 w-full',
  compact: 'h-60 w-full',
};

function WorkspaceTabs(props: React.ComponentProps<typeof Tabs>) {
  return <Tabs {...props} />;
}

function WorkspaceTabsList({ className, ...props }: React.ComponentProps<typeof TabsList>) {
  return (
    <TabsList
      className={cn(
        'h-auto w-full max-w-2xl justify-start overflow-x-auto rounded-lg border bg-muted/40 p-1 text-muted-foreground no-scrollbar',
        className,
      )}
      {...props}
    />
  );
}

function WorkspaceTabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={cn(
        'flex-none px-3 py-2 text-center text-xs font-semibold tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
        className,
      )}
      {...props}
    />
  );
}

function WorkspaceTabsContent(props: React.ComponentProps<typeof TabsContent>) {
  return <TabsContent {...props} />;
}

function WorkspaceTabsFallback({ size = 'panel' }: { size?: WorkspaceTabsFallbackSize }) {
  return <Skeleton className={workspaceTabsFallbackSizeClassName[size]} />;
}

export { WorkspaceTabs, WorkspaceTabsContent, WorkspaceTabsFallback, WorkspaceTabsList, WorkspaceTabsTrigger };
