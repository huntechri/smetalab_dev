'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EstimatesListTable } from '@/features/projects/estimates/components/registry/EstimatesListTable';
import { CreateEstimateDialog } from '@/features/projects/estimates/components/CreateEstimateDialog';
import { useRouter } from 'next/navigation';

type EstimateListItem = {
    id: string;
    projectId: string;
    name: string;
    slug: string;
    status: string;
    total: number;
    createdAt: Date;
    updatedAt: Date;
};

type ProjectEstimatesTableProps = {
    projectId: string;
    projectSlug: string;
    initialEstimates: EstimateListItem[];
};

export function ProjectEstimatesTable({ projectId, projectSlug, initialEstimates }: ProjectEstimatesTableProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();

    const mappedEstimates = useMemo(
        () =>
            initialEstimates.map((item) => ({
                id: item.id,
                projectId: item.projectId,
                name: item.name,
                slug: item.slug,
                status: item.status as 'draft' | 'in_progress' | 'approved',
                total: item.total,
                createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
                updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : String(item.updatedAt),
            })),
        [initialEstimates]
    );

    const handleSuccess = useCallback(() => {
        router.refresh();
    }, [router]);

    return (
        <div className="space-y-4 px-4 lg:px-6">
            <div className="flex justify-end">
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="size-4" />
                    Создать смету
                </Button>
            </div>
            <EstimatesListTable estimates={mappedEstimates} projectSlug={projectSlug} />

            <CreateEstimateDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                projectId={projectId}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
