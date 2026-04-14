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
            <SelectTrigger className="h-8 w-full sm:w-[180px] lg:w-[220px] transition-all bg-white hover:bg-secondary border-border rounded-[7.6px] px-2 text-[14px] font-medium leading-[20px] gap-[6px] shadow-none ring-0 focus:ring-0 focus:ring-offset-0">
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
