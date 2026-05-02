'use client';

import * as React from 'react';

import { Button } from '@/shared/ui/button';
import { CatalogAiModeIndicator } from '@/shared/ui/catalog-token';
import { SearchInput } from '@/shared/ui/search-input';
import { Switch } from '@/shared/ui/switch';
import { cn } from '@/lib/utils';

type SearchControlWidth = 'default' | 'full';

type SearchControlProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  aiPlaceholder?: string;
  highlighted?: boolean;
  loading?: boolean;
  autoLoading?: boolean;
  onSubmit?: () => void;
  submitLabel?: string;
  disabled?: boolean;
  isAiMode?: boolean;
  onAiModeChange?: (value: boolean) => void;
  showAiMode?: boolean;
  width?: SearchControlWidth;
  className?: string;
  inputAriaLabel?: string;
};

const searchControlWidthClassName: Record<SearchControlWidth, string> = {
  default: 'w-[min(20rem,calc(100vw-2rem))] max-w-full',
  full: 'w-full',
};

function SearchControl({
  value,
  onValueChange,
  placeholder = 'Поиск...',
  aiPlaceholder = 'Опишите, что нужно найти...',
  highlighted = false,
  loading = false,
  autoLoading,
  onSubmit,
  submitLabel = 'Поиск',
  disabled = false,
  isAiMode = false,
  onAiModeChange,
  showAiMode = Boolean(onAiModeChange),
  width = 'default',
  className,
  inputAriaLabel,
}: SearchControlProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2', width === 'full' && 'w-full', className)}>
      <div className={cn('min-w-0', searchControlWidthClassName[width])}>
        <SearchInput
          aria-label={inputAriaLabel ?? placeholder}
          placeholder={isAiMode ? aiPlaceholder : placeholder}
          highlighted={highlighted || isAiMode}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && onSubmit) {
              event.preventDefault();
              onSubmit();
            }
          }}
          loading={loading}
          autoLoading={autoLoading ?? !loading}
        />
      </div>

      {onSubmit ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSubmit}
          disabled={disabled || loading}
        >
          {submitLabel}
        </Button>
      ) : null}

      {showAiMode && onAiModeChange ? (
        <div className="flex shrink-0 items-center gap-2 px-1">
          <CatalogAiModeIndicator active={Boolean(isAiMode)} />
          <Switch
            checked={Boolean(isAiMode)}
            onCheckedChange={onAiModeChange}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      ) : null}
    </div>
  );
}

export { SearchControl };
export type { SearchControlProps };
