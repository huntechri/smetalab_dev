import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { ProjectSortOption } from '../../shared/types';

type ProjectsSortSelectProps = {
    value: ProjectSortOption;
    onValueChange: (value: ProjectSortOption) => void;
};

export function ProjectsSortSelect({ value, onValueChange }: ProjectsSortSelectProps) {
    return (
        <Select value={value} onValueChange={(nextValue) => onValueChange(nextValue as ProjectSortOption)}>
            <SelectTrigger className="h-9 w-full sm:w-[180px] lg:w-[220px] transition-colors focus:ring-1">
                <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="name">Название (А→Я)</SelectItem>
                <SelectItem value="contractAmount">Сумма контракта (по убыв.)</SelectItem>
                <SelectItem value="startDate">Дата начала (сначала новые)</SelectItem>
                <SelectItem value="endDate">Дата окончания (ближайшие)</SelectItem>
                <SelectItem value="progress">Прогресс (по убыв.)</SelectItem>
            </SelectContent>
        </Select>
    );
}
