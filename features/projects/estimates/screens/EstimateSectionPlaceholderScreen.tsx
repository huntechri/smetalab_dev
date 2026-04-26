import { EmptyState } from '@/shared/ui/states';

interface EstimateSectionPlaceholderScreenProps {
    title: string;
    description: string;
}

export function EstimateSectionPlaceholderScreen({ title, description }: EstimateSectionPlaceholderScreenProps) {
    return <EmptyState title={title} description={description} />;
}
