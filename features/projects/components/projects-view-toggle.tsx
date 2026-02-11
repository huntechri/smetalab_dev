import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectViewMode } from '../types';

type ProjectsViewToggleProps = {
    value: ProjectViewMode;
    onValueChange: (value: ProjectViewMode) => void;
};

export function ProjectsViewToggle({ value, onValueChange }: ProjectsViewToggleProps) {
    return (
        <div className="flex items-center gap-1">
            <Button
                type="button"
                variant={value === 'grid' ? 'default' : 'outline'}
                size="icon-sm"
                onClick={() => onValueChange('grid')}
                aria-label="Grid view"
            >
                <LayoutGrid className="size-4" />
            </Button>
            <Button
                type="button"
                variant={value === 'list' ? 'default' : 'outline'}
                size="icon-sm"
                onClick={() => onValueChange('list')}
                aria-label="List view"
            >
                <List className="size-4" />
            </Button>
        </div>
    );
}
