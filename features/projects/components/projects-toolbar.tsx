import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProjectsSearchInput } from './projects-search-input';
import { ProjectsSortSelect } from './projects-sort-select';
import { ProjectsViewToggle } from './projects-view-toggle';
import { ProjectSortOption, ProjectViewMode } from '../types';

type ProjectsToolbarProps = {
    searchQuery: string;
    sortOption: ProjectSortOption;
    viewMode: ProjectViewMode;
    onSearchQueryChange: (value: string) => void;
    onSortOptionChange: (value: ProjectSortOption) => void;
    onViewModeChange: (value: ProjectViewMode) => void;
};

export function ProjectsToolbar({
    searchQuery,
    sortOption,
    viewMode,
    onSearchQueryChange,
    onSortOptionChange,
    onViewModeChange,
}: ProjectsToolbarProps) {
    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <ProjectsSearchInput value={searchQuery} onChange={onSearchQueryChange} />
                <ProjectsSortSelect value={sortOption} onValueChange={onSortOptionChange} />
                <ProjectsViewToggle value={viewMode} onValueChange={onViewModeChange} />
            </div>
            <Button asChild>
                <Link href="/app/projects?create=1">Create project</Link>
            </Button>
        </div>
    );
}
