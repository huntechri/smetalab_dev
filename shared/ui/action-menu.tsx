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
import { Button, type ButtonProps } from '@/shared/ui/button';
import { cn } from '@/lib/utils';

export type ActionDensity = 'default' | 'compact';

export const actionMenuTriggerIconClassName = 'size-4';
export const actionMenuContentClassName = 'min-w-[12rem]';
export const actionMenuItemClassName = 'gap-2';
export const actionMenuItemIconClassName =
  'flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0';
export const actionInlineGroupClassName = 'flex items-center gap-2';
export const actionButtonLabelClassName = 'hidden sm:inline';
export const actionButtonMobileIconClassName = 'size-4 sm:hidden';

const actionButtonGroupDensityClassNames = {
  default: 'grid grid-cols-3 gap-2 pt-2',
  compact: 'grid w-full grid-cols-3 gap-1.5 sm:gap-2',
} as const;

export interface ActionMenuItemContentProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function ActionMenuItemContent({ icon, children }: ActionMenuItemContentProps) {
  return (
    <>
      {icon ? <span className={actionMenuItemIconClassName}>{icon}</span> : null}
      <span>{children}</span>
    </>
  );
}

export interface ActionIconButtonProps extends Omit<Button size="xs"Props, 'children'> {
  label: string;
  icon: React.ReactNode;
}

export function ActionIconButton({
  label,
  icon,
  variant = 'ghost',
  size = 'icon-sm',
  'aria-label': ariaLabel,
  ...props
}: ActionIconButtonProps) {
  return (
    <Button variant={variant} size={size} {...props} aria-label={ariaLabel ?? label}>
      <span className="sr-only">{label}</span>
      {icon}
    </Button>
  );
}

export interface ActionButtonGroupProps extends React.ComponentProps<'div'> {
  density?: ActionDensity;
}

export function ActionButtonGroup({
  density = 'default',
  className,
  ...props
}: ActionButtonGroupProps) {
  return (
    <div
      className={cn(actionButtonGroupDensityClassNames[density], className)}
      {...props}
    />
  );
}

export interface ConfirmActionProps {
  trigger: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  onConfirm: () => void;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  confirmVariant?: ButtonProps['variant'];
  contentSize?: 'default' | 'sm';
}

export function ConfirmAction({
  trigger,
  title,
  description,
  onConfirm,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  confirmVariant = 'destructive',
  contentSize = 'default',
}: ConfirmActionProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent size={contentSize}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
   * Whether the menu should be modal (Radix DropdownMenu behavior).
   * Defaults to true for backward compatibility.
   */
  modal?: boolean;
  /**
   * Optional custom aria-label for the trigger
   */
  ariaLabel?: string;
  contentClassName?: string;
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
  modal = true,
  contentClassName,
}: ActionMenuProps) {
  // We only support one confirmation dialog at a time (standard for menus)
  const [activeConfirmItem, setActiveConfirmItem] = React.useState<ActionMenuItem | null>(
    null
  );

  return (
    <>
      <DropdownMenu modal={modal}>
        <DropdownMenuTrigger asChild>
          {trigger || (
            <ActionIconButton
              variant="outline"
              size="icon-xs"
              label={ariaLabel}
              icon={<MoreHorizontal className={actionMenuTriggerIconClassName} />}
            />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className={cn(actionMenuContentClassName, contentClassName)}>
          {items.map((item, index) => {
            const isDestructive = item.variant === 'destructive';
            const ItemContent = (
              <ActionMenuItemContent icon={item.icon}>{item.label}</ActionMenuItemContent>
            );

            if (item.requiresConfirmation) {
              return (
                <DropdownMenuItem
                  key={index}
                  onSelect={() => {
                    queueMicrotask(() => setActiveConfirmItem(item));
                  }}
                  disabled={item.disabled}
                  variant={isDestructive ? 'destructive' : 'default'}
                  className={actionMenuItemClassName}
                >
                  {ItemContent}
                </DropdownMenuItem>
              );
            }

            return (
              <DropdownMenuItem
                key={index}
                onSelect={item.onClick}
                disabled={item.disabled}
                variant={isDestructive ? 'destructive' : 'default'}
                className={actionMenuItemClassName}
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
