import { SearchInput } from '@repo/ui';

type ProjectsSearchInputProps = {
    value: string;
    onChange: (value: string) => void;
};

export function ProjectsSearchInput({ value, onChange }: ProjectsSearchInputProps) {
    return (
        <div className="w-[min(20rem,calc(100vw-2rem))]">
            <SearchInput
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Поиск..."
                aria-label="Поиск проектов"
            />
        </div>
    );
}
