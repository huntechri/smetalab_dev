import { Card } from '@/components/ui/card';

export function ProjectsKpiPlaceholders() {
    return (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="h-24 py-0" />
            ))}
        </div>
    );
}
