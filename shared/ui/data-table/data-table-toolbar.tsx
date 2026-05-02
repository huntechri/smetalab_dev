"use client"

import * as React from "react"

import { SearchControl } from "@/shared/ui/search-control"
import {
    Toolbar,
    ToolbarActionGroup,
    ToolbarGroup,
} from "@/shared/ui/toolbar"

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

    const handleSearchValueChange = React.useCallback((value: string) => {
        setSearchValue(value)
        onSearchValueChange?.(value)

        if (value === "") {
            onSearch?.("")
        }
    }, [onSearch, onSearchValueChange, setSearchValue])

    const handleAiModeChange = React.useCallback((checked: boolean) => {
        setIsAiMode(checked)
        if (searchValue.trim() && checked) {
            onSearch?.(searchValue)
        }
    }, [onSearch, searchValue, setIsAiMode])

    if (!actions && !hasFilterControls) return null;

    return (
        <Toolbar responsive={compactMobileToolbar ? "nowrap" : "stack"}>
            {hasFilterControls ? (
                <ToolbarGroup
                    grow={compactMobileToolbar}
                    fullWidthOnMobile={!compactMobileToolbar}
                    className={compactMobileToolbar ? "min-w-0" : "xl:w-auto"}
                >
                    <SearchControl
                        inputAriaLabel={filterPlaceholder}
                        placeholder={filterPlaceholder}
                        aiPlaceholder="Опишите, что нужно найти (ИИ)..."
                        value={searchValue}
                        onValueChange={handleSearchValueChange}
                        onSubmit={onSearch ? handleSearchClick : undefined}
                        showSubmitButton={false}
                        loading={Boolean(isSearching)}
                        autoLoading={!isSearching}
                        isAiMode={isAiMode}
                        onAiModeChange={showAiSearch && onSearch ? handleAiModeChange : undefined}
                        showAiMode={Boolean(showAiSearch && onSearch)}
                    />
                </ToolbarGroup>
            ) : null}

            {actions ? (
                <ToolbarActionGroup
                    label="Действия таблицы"
                    align={compactMobileToolbar || !hasFilterControls ? "end" : "start"}
                    fullWidthOnMobile={!compactMobileToolbar && hasFilterControls}
                    className={hasFilterControls ? "xl:w-auto" : "xl:w-full"}
                >
                    {actions}
                </ToolbarActionGroup>
            ) : null}
        </Toolbar>
    );
}
