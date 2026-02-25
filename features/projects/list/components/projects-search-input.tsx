import { Input } from '@/components/ui/input';

type ProjectsSearchInputProps = {
    value: string;
    onChange: (value: string) => void;
};

export function ProjectsSearchInput({ value, onChange }: ProjectsSearchInputProps) {
    return (
        <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Поиск по проекту или заказчику"
            className="w-full sm:w-72 h-8 text-xs placeholder:text-xs"
            aria-label="Поиск проектов"
        />
    );
}
