'use client';

import type { KeyboardEvent } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { WorkCatalogCategories } from './WorkCatalogCategories.client';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={isAiMode ? 'Опишите, что нужно найти...' : 'Поиск по названию или коду...'}
                            className={cn(
                                'pl-9 h-10 bg-muted/30 focus-visible:ring-primary/20 transition-all border-none',
                                isAiMode && 'ring-1 ring-primary/20 shadow-[0_0_15px_-3px_rgba(var(--primary),0.1)]'
                            )}
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />
                    </div>
                    {onSearchSubmit && (
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10"
                            onClick={onSearchSubmit}
                            disabled={isSearching}
                        >
                            Поиск
                        </Button>
                    )}
                    {onAiModeChange && (
                        <div className="flex items-center gap-2 px-1">
                            <div className={cn(
                                'flex items-center justify-center h-8 w-8 rounded-full transition-all duration-300',
                                isAiMode ? 'bg-primary/10 text-primary animate-pulse' : 'bg-muted text-muted-foreground'
                            )}>
                                <Sparkles className="h-4 w-4" />
                            </div>
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
