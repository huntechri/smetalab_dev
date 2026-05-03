'use client';

import * as React from 'react';
import { Button } from '@/shared/ui/button';
import { ProjectsSearchInput } from './projects-search-input';
import { Toolbar, ToolbarGroup } from '@/shared/ui/toolbar';
import { ProjectsSortSelect } from './projects-sort-select';
import { ProjectSortOption } from '../../shared/types';

type ProjectsToolbarProps = {
    searchQuery: string;
    sortOption: ProjectSortOption;
    onSearchQueryChange: (value: string) => void;
    onSortOptionChange: (value: ProjectSortOption) => void;
    onAddClick: () => void;
};

export function ProjectsToolbar({
    searchQuery,
    sortOption,
    onSearchQueryChange,
    onSortOptionChange,
    onAddClick,
}: ProjectsToolbarProps) {
    return (
        <Toolbar responsive="stack" align="between">
            <ToolbarGroup grow scroll>
                <div className="sm:flex-1">
                    <ProjectsSearchInput value={searchQuery} onChange={onSearchQueryChange} />
                </div>
                <div>
                    <ProjectsSortSelect value={sortOption} onValueChange={onSortOptionChange} />
                </div>
            </ToolbarGroup>
            <Button
                onClick={onAddClick}
                variant="brand"
                size="default"
            >
                Создать проект
            </Button>
        </Toolbar>
    );
}
