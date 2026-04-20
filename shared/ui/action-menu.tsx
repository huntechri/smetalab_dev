'use client';

import * as React from 'react';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';

/**
 * Item definition for ActionMenu
 */
export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
  /**
   * If true, this item will trigger an AlertDialog before executing onClick
   */
  requiresConfirmation?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
  confirmLabel?: string;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  /**
   * Custom trigger element. Defaults to a ghost icon button.
   */
  trigger?: React.ReactNode;
  /**
   * Alignment of the dropdown menu
   */
  align?: 'start' | 'end' | 'center';
  /**
   * Optional custom aria-label for the trigger
   */
  ariaLabel?: string;
}

/**
 * A combined DropdownMenu and AlertDialog component for common action patterns.
 * Supports standard items and items that require confirmation (e.g., delete).
 */
export function ActionMenu({
  items,
  trigger,
  align = 'end',
  ariaLabel = 'Действия',
}: ActionMenuProps) {
  // We only support one confirmation dialog at a time (standard for menus)
  const [activeConfirmItem, setActiveConfirmItem] = React.useState<ActionMenuItem | null>(
    null
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger || (
            <Button
              variant="outline"
              size="icon-xs"
              aria-label={ariaLabel}
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align}>
          {items.map((item, index) => {
            const isDestructive = item.variant === 'destructive';

            const ItemContent = (
              <>
                {item.icon && <span className="mr-2 h-4 w-4 shrink-0">{item.icon}</span>}
                {item.label}
              </>
            );

            if (item.requiresConfirmation) {
              return (
                <AlertDialogTrigger
                  key={index}
                  asChild
                  onClick={() => setActiveConfirmItem(item)}
                >
                  <DropdownMenuItem
                    disabled={item.disabled}
                    className={cn(isDestructive && 'text-destructive focus:text-destructive')}
                  >
                    {ItemContent}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              );
            }

            return (
              <DropdownMenuItem
                key={index}
                onClick={item.onClick}
                disabled={item.disabled}
                className={cn(isDestructive && 'text-destructive focus:text-destructive')}
              >
                {ItemContent}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={!!activeConfirmItem}
        onOpenChange={(open) => !open && setActiveConfirmItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {activeConfirmItem?.confirmTitle || 'Вы уверены?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activeConfirmItem?.confirmDescription || 'Это действие нельзя будет отменить.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              variant={activeConfirmItem?.variant === 'destructive' ? 'destructive' : 'default'}
              className={cn(
                activeConfirmItem?.variant === 'destructive' &&
                  'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              )}
              onClick={() => {
                activeConfirmItem?.onClick();
                setActiveConfirmItem(null);
              }}
            >
              {activeConfirmItem?.confirmLabel || 'Подтвердить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
