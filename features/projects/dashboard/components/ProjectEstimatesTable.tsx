'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CreateEstimateDialog } from '@/features/projects/estimates/components/CreateEstimateDialog';
import { useRouter } from 'next/navigation';
import { useEstimateMutations } from '@/features/projects/estimates/hooks/use-estimate-mutations';
import type { EstimateMeta, EstimateStatus } from '@/features/projects/estimates/types/dto';
import { ProjectEstimatesCards } from './ProjectEstimatesCards';

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
    const { updateEstimateStatus, deleteEstimate } = useEstimateMutations();

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
    const [rows, setRows] = useState<EstimateMeta[]>(mappedEstimates);

    useEffect(() => {
        setRows(mappedEstimates);
    }, [mappedEstimates]);

    const handleSuccess = useCallback(() => {
        router.refresh();
    }, [router]);

    const handleChangeStatus = useCallback(
        async (estimate: EstimateMeta, nextStatus: EstimateStatus) => {
            await updateEstimateStatus({
                estimateId: estimate.id,
                currentStatus: estimate.status,
                nextStatus,
                setRows,
            });
        },
        [updateEstimateStatus],
    );

    const handleDeleteEstimate = useCallback(
        async (estimate: EstimateMeta) => {
            await deleteEstimate({
                estimateId: estimate.id,
                estimateName: estimate.name,
                setRows,
            });
        },
        [deleteEstimate],
    );

    return (
        <div className="space-y-4">
            <ProjectEstimatesCards
                estimates={rows}
                projectSlug={projectSlug}
                onCreateEstimate={() => setIsDialogOpen(true)}
                onChangeStatus={handleChangeStatus}
                onDeleteEstimate={handleDeleteEstimate}
            />

            <CreateEstimateDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                projectId={projectId}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
