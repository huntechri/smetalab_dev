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
                <SelectValue placeholder="Сортировка проектов" />
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
