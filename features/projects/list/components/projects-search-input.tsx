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
            placeholder="Поиск..."
            className="w-full sm:w-[280px] lg:w-[320px] h-8 text-[14px] font-medium leading-[20px] transition-colors bg-white hover:bg-secondary border-border rounded-[7.6px] px-2 py-0 placeholder:text-[12px]"
            aria-label="Поиск проектов"
        />
    );
}
