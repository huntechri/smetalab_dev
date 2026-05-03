import { SearchInput } from '@/shared/ui/search-input';

type ProjectsSearchInputProps = {
    value: string;
    onChange: (value: string) => void;
};

export function ProjectsSearchInput({ value, onChange }: ProjectsSearchInputProps) {
    return (
        <div className="w-full max-w-xs sm:max-w-sm">
            <SearchInput
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Поиск..."
                aria-label="Поиск проектов"
            />
        </div>
    );
}
