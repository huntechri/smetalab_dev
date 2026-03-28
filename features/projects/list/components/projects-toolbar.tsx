'use client';

import * as React from 'react';
import { Button } from '@/shared/ui/button';
import { ProjectsSearchInput } from './projects-search-input';
import { ProjectsSortSelect } from './projects-sort-select';
import { ProjectsViewToggle } from './projects-view-toggle';
import { ProjectSortOption, ProjectViewMode } from '../../shared/types';

type ProjectsToolbarProps = {
    searchQuery: string;
    sortOption: ProjectSortOption;
    viewMode: ProjectViewMode;
    onSearchQueryChange: (value: string) => void;
    onSortOptionChange: (value: ProjectSortOption) => void;
    onViewModeChange: (value: ProjectViewMode) => void;
    onAddClick: () => void;
};

export function ProjectsToolbar({
    searchQuery,
    sortOption,
    viewMode,
    onSearchQueryChange,
    onSortOptionChange,
    onViewModeChange,
    onAddClick,
}: ProjectsToolbarProps) {
    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <div className="w-full sm:flex-1">
                    <ProjectsSearchInput value={searchQuery} onChange={onSearchQueryChange} />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex-1 sm:flex-initial">
                        <ProjectsSortSelect value={sortOption} onValueChange={onSortOptionChange} />
                    </div>
                    <ProjectsViewToggle value={viewMode} onValueChange={onViewModeChange} />
                </div>
            </div>
            <Button
                onClick={onAddClick}
                variant="ghost"
                className="w-full sm:w-auto h-9 text-[14px] font-medium leading-[20px] transition-colors bg-white hover:bg-secondary border border-border rounded-[7.6px] px-3 active:scale-95 shadow-none"
            >
                Создать проект
            </Button>
        </div>
    );
}
