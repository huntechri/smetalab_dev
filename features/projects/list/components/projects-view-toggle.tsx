import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { ProjectViewMode } from '../../shared/types';

type ProjectsViewToggleProps = {
    value: ProjectViewMode;
    onValueChange: (value: ProjectViewMode) => void;
};

export function ProjectsViewToggle({ value, onValueChange }: ProjectsViewToggleProps) {
    return (
        <div className="flex items-center gap-1.5">
            <Button
                type="button"
                variant={value === 'grid' ? 'secondary' : 'ghost'}
                className="h-9 w-9 px-0 transition-colors"
                onClick={() => onValueChange('grid')}
                aria-label="Grid view"
            >
                <LayoutGrid className="size-4" />
            </Button>
            <Button
                type="button"
                variant={value === 'list' ? 'secondary' : 'ghost'}
                className="h-9 w-9 px-0 transition-colors"
                onClick={() => onValueChange('list')}
                aria-label="List view"
            >
                <List className="size-4" />
            </Button>
        </div>
    );
}
