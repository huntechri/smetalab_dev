import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';
import { ProjectViewMode } from '../../shared/types';

type ProjectsViewToggleProps = {
    value: ProjectViewMode;
    onValueChange: (value: ProjectViewMode) => void;
};

export function ProjectsViewToggle({ value, onValueChange }: ProjectsViewToggleProps) {
    return (
        <div className="flex items-center gap-1.5 p-0.5">
            <Button
                type="button"
                variant="standard"
                className={cn(
                    "h-8 w-9 px-0",
                    value === 'grid' && "bg-secondary"
                )}
                onClick={() => onValueChange('grid')}
                aria-label="Grid view"
            >
                <LayoutGrid className="size-4" />
            </Button>
            <Button
                type="button"
                variant="standard"
                className={cn(
                    "h-8 w-9 px-0",
                    value === 'list' && "bg-secondary"
                )}
                onClick={() => onValueChange('list')}
                aria-label="List view"
            >
                <List className="size-4" />
            </Button>
        </div>
    );
}
