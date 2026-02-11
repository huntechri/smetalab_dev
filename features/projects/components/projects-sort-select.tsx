import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ProjectSortOption } from '../types';

type ProjectsSortSelectProps = {
    value: ProjectSortOption;
    onValueChange: (value: ProjectSortOption) => void;
};

export function ProjectsSortSelect({ value, onValueChange }: ProjectsSortSelectProps) {
    return (
        <Select value={value} onValueChange={(nextValue) => onValueChange(nextValue as ProjectSortOption)}>
            <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Sort projects" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="name">Name (A→Z)</SelectItem>
                <SelectItem value="contractAmount">Contract amount (desc)</SelectItem>
                <SelectItem value="startDate">Start date (newest first)</SelectItem>
                <SelectItem value="endDate">End date (nearest first)</SelectItem>
                <SelectItem value="progress">Progress (desc)</SelectItem>
            </SelectContent>
        </Select>
    );
}
