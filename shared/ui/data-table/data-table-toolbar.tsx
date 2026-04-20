"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { SearchInput } from "@/shared/ui/search-input"
import { Switch } from "@/shared/ui/switch"
import { Badge } from "@/shared/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/shared/ui/tooltip"

interface DataTableToolbarProps {
    searchValue: string
    setSearchValue: (val: string) => void
    filterPlaceholder?: string
    isSearching?: boolean
    isAiMode: boolean
    setIsAiMode: (val: boolean) => void
    onSearch?: (query: string) => void
    onSearchValueChange?: (val: string) => void
    showAiSearch?: boolean
    compactMobileToolbar?: boolean
    actions?: React.ReactNode
    hasFilterControls?: boolean
}

export function DataTableToolbar({
    searchValue,
    setSearchValue,
    filterPlaceholder = "Поиск...",
    isSearching,
    isAiMode,
    setIsAiMode,
    onSearch,
    onSearchValueChange,
    showAiSearch,
    compactMobileToolbar,
    actions,
    hasFilterControls
}: DataTableToolbarProps) {
    const handleSearchClick = React.useCallback(() => {
        if (searchValue.trim()) {
            onSearch?.(searchValue)
        }
    }, [searchValue, onSearch]);

    if (!actions && !hasFilterControls) return null;

    return (
        <div className={cn(
            "justify-between px-1 md:px-0",
            compactMobileToolbar
                ? "flex items-center gap-2 xl:flex-row xl:items-center"
                : "flex flex-col gap-3 xl:flex-row xl:items-center"
        )}>
            {/* Search Input & AI Toggle Group */}
            {hasFilterControls ? (
                <div className={cn(
                    "flex items-center gap-2 shrink-0",
                    compactMobileToolbar ? "w-full min-w-0 flex-1" : "w-full xl:w-auto"
                )}>
                    <div className={cn(
                        "relative transition-all duration-300 w-[min(20rem,calc(100vw-2rem))] max-w-full",
                        isAiMode && "[&_input]:pr-16"
                    )}>
                        <SearchInput
                            aria-label={filterPlaceholder}
                            placeholder={isAiMode ? "Опишите, что нужно найти (ИИ)..." : filterPlaceholder}
                            value={searchValue}
                            loading={Boolean(isSearching)}
                            autoLoading={!isSearching}
                            highlighted={isAiMode}
                            onChange={(event) => {
                                const val = event.target.value
                                setSearchValue(val)
                                onSearchValueChange?.(val)

                                if (val === "") {
                                    onSearch?.("")
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearchClick()
                                }
                            }}
                        />
                        {isAiMode && (
                            <Badge
                                role="status"
                                aria-live="polite"
                                variant="default"
                                className="absolute right-10 top-1/2 -translate-y-1/2 animate-in fade-in zoom-in duration-300"
                            >
                                AI
                            </Badge>
                        )}
                    </div>

                    {showAiSearch && onSearch && (
                        <div className="flex shrink-0 items-center gap-2 px-2 h-7 rounded-md border border-border bg-muted/30">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-3 cursor-help">
                                        <Sparkles className={cn("h-4 w-4 shrink-0", isAiMode ? "text-foreground" : "text-muted-foreground")} />
                                        <span className="text-[12px] font-medium text-muted-foreground whitespace-nowrap hidden sm:inline">Умный поиск</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Поиск по смыслу с использованием ИИ</p>
                                </TooltipContent>
                            </Tooltip>
                            <Switch
                                checked={isAiMode}
                                onCheckedChange={(checked) => {
                                    setIsAiMode(checked)
                                    if (searchValue.trim() && checked) {
                                        onSearch?.(searchValue)
                                    }
                                }}
                                aria-label="Переключатель ИИ поиска"
                                className="select-none"
                            />
                        </div>
                    )}
                </div>
            ) : null}

            {/* Actions Group */}
            {actions && (
                <div
                    className={cn(
                        "flex items-center gap-2 xl:justify-end overflow-x-auto xl:pb-0 scrollbar-hide",
                        hasFilterControls ? "xl:w-auto" : "xl:w-full",
                        compactMobileToolbar
                            ? "w-auto justify-end shrink-0"
                            : hasFilterControls
                                ? "w-full justify-start"
                                : "w-full justify-end"
                    )}
                    role="group"
                    aria-label="Действия таблицы"
                >
                    {actions}
                </div>
            )}
        </div>
    );
}
