import { Surface } from '@/shared/ui/surface';
import { primitiveVisualTypographyClassNames } from '@/shared/ui/primitive-surface';

export function EstimateDocuments() {
    return (
        <Surface variant="card" density="default">
            <p className={primitiveVisualTypographyClassNames.mutedMeta}>Документы (заглушка).</p>
        </Surface>
    );
}
