import { Input } from '@/shared/ui/input';

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
            className="w-full sm:w-[280px] lg:w-[320px] h-9 text-sm transition-colors focus-visible:ring-1"
            aria-label="Поиск проектов"
        />
    );
}
