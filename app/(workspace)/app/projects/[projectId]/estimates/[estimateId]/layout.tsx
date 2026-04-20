import { EstimateDetailsLayout } from '@/features/projects/estimates/layouts/EstimateDetailsLayout';

export default function EstimateLayout({ children }: { children: React.ReactNode }) {
    return <EstimateDetailsLayout>{children}</EstimateDetailsLayout>;
}
