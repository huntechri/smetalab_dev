import { SearchInput } from '@/shared/ui/search-input';

type ProjectsSearchInputProps = {
    value: string;
    onChange: (value: string) => void;
};

export function ProjectsSearchInput({ value, onChange }: ProjectsSearchInputProps) {
    return (
        <SearchInput
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Поиск..."
            className="w-[min(20rem,calc(100vw-2rem))]"
            aria-label="Поиск проектов"
        />
    );
}
