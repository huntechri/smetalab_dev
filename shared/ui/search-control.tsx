'use client';

import * as React from 'react';

import { Button, type ButtonProps } from '@/shared/ui/button';
import { CatalogAiModeIndicator } from '@/shared/ui/catalog-token';
import { SearchInput } from '@/shared/ui/search-input';
import { Switch } from '@/shared/ui/switch';
import { cn } from '@/lib/utils';

type SearchControlWidth = 'default' | 'full';
type SearchControlLayout = 'inline' | 'stack';
type SearchControlDensity = 'compact' | 'default';

type SearchControlProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  aiPlaceholder?: string;
  highlighted?: boolean;
  loading?: boolean;
  autoLoading?: boolean;
  onSubmit?: () => void;
  showSubmitButton?: boolean;
  submitLabel?: string;
  submitSize?: ButtonProps['size'];
  disabled?: boolean;
  isAiMode?: boolean;
  onAiModeChange?: (value: boolean) => void;
  showAiMode?: boolean;
  width?: SearchControlWidth;
  layout?: SearchControlLayout;
  density?: SearchControlDensity;
  className?: string;
  inputAriaLabel?: string;
};

const searchControlWidthClassName: Record<SearchControlWidth, string> = {
  default: 'w-[min(20rem,calc(100vw-2rem))] max-w-full',
  full: 'w-full',
};

const searchControlLayoutClassName: Record<SearchControlLayout, string> = {
  inline: 'flex min-w-0 items-center',
  stack: 'flex flex-col min-w-0 gap-2',
};

const searchControlDensityClassName: Record<SearchControlDensity, string> = {
  compact: 'gap-1.5',
  default: 'gap-2',
};

const searchControlAiModeClassName: Record<SearchControlDensity, string> = {
  compact: 'gap-1',
  default: 'gap-2',
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
  showSubmitButton = Boolean(onSubmit),
  submitLabel = 'Поиск',
  submitSize = 'default',
  disabled = false,
  isAiMode = false,
  onAiModeChange,
  showAiMode = Boolean(onAiModeChange),
  width = 'default',
  layout = 'inline',
  density = 'default',
  className,
  inputAriaLabel,
}: SearchControlProps) {
  return (
    <div
      className={cn(
        searchControlLayoutClassName[layout],
        searchControlDensityClassName[density],
        width === 'full' && 'w-full',
        className,
      )}
    >
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

      {showSubmitButton && onSubmit ? (
        <Button
          type="button"
          variant="outline"
          size={submitSize}
          onClick={onSubmit}
          disabled={disabled || loading}
        >
          {submitLabel}
        </Button>
      ) : null}

      {showAiMode && onAiModeChange ? (
        <div
          className={cn(
            'flex shrink-0 items-center',
            searchControlAiModeClassName[density],
            'px-1',
          )}
        >
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
export type { SearchControlDensity, SearchControlLayout, SearchControlProps };
