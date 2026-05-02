'use client';

import type { KeyboardEvent } from 'react';
import { Button } from '@/shared/ui/button';
import { CatalogAiModeIndicator } from '@/shared/ui/catalog-token';
import { SearchInput } from '@/shared/ui/search-input';
import { Switch } from '@/shared/ui/switch';
import { WorkCatalogCategories } from './WorkCatalogCategories.client';

interface Props {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    isAiMode?: boolean;
    onAiModeChange?: (val: boolean) => void;
    onSearchSubmit?: () => void;
    isSearching?: boolean;
    loadCategories?: () => Promise<string[]>;
    allCategoriesLabel?: string;
}

export function WorkCatalogFilters({
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    isAiMode,
    onAiModeChange,
    onSearchSubmit,
    isSearching,
    loadCategories,
    allCategoriesLabel,
}: Props) {
    const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && onSearchSubmit) {
            event.preventDefault();
            onSearchSubmit();
        }
    };

    return (
        <div className="flex flex-col shrink-0 bg-background/95 backdrop-blur-sm z-20">
            <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="w-[min(20rem,calc(100vw-2rem))] max-w-full min-w-0">
                        <SearchInput
                            placeholder={isAiMode ? 'Опишите, что нужно найти...' : 'Поиск по названию или коду...'}
                            highlighted={isAiMode}
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            loading={Boolean(isSearching)}
                            autoLoading={!isSearching}
                        />
                    </div>
                    {onSearchSubmit && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onSearchSubmit}
                            disabled={isSearching}
                        >
                            Поиск
                        </Button>
                    )}
                    {onAiModeChange && (
                        <div className="flex items-center gap-2 px-1">
                            <CatalogAiModeIndicator active={Boolean(isAiMode)} />
                            <Switch
                                checked={isAiMode}
                                onCheckedChange={onAiModeChange}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                    )}
                </div>
            </div>

            <WorkCatalogCategories
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
                loadCategories={loadCategories}
                allLabel={allCategoriesLabel}
            />
        </div>
    );
}
