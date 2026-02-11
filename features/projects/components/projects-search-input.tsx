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
            placeholder="Search by project or customer"
            className="w-full sm:w-72"
            aria-label="Search projects"
        />
    );
}
