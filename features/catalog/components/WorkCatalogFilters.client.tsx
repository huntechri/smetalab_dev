'use client';

import { SearchControl } from '@/shared/ui/search-control';
import { Toolbar, ToolbarGroup } from '@/shared/ui/toolbar';
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
    return (
        <div className="flex flex-col shrink-0 bg-background/95 backdrop-blur-sm z-20">
            <Toolbar variant="surface" responsive="nowrap" align="start">
                <ToolbarGroup>
                    <SearchControl
                        placeholder="Поиск по названию или коду..."
                        aiPlaceholder="Опишите, что нужно найти..."
                        value={searchQuery}
                        onValueChange={onSearchChange}
                        onSubmit={onSearchSubmit}
                        submitSize="sm"
                        loading={Boolean(isSearching)}
                        autoLoading={!isSearching}
                        isAiMode={Boolean(isAiMode)}
                        onAiModeChange={onAiModeChange}
                        showAiMode={Boolean(onAiModeChange)}
                    />
                </ToolbarGroup>
            </Toolbar>

            <WorkCatalogCategories
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
                loadCategories={loadCategories}
                allLabel={allCategoriesLabel}
            />
        </div>
    );
}
