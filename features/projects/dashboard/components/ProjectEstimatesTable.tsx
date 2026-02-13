'use client';

import { useTransition, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EstimateMeta } from '@/features/projects/estimates/types/dto';
import { EstimatesListTable } from '@/features/projects/estimates/components/registry/EstimatesListTable';
import { estimatesMockRepo } from '@/features/projects/estimates/repository';

type ProjectEstimatesTableProps = {
    projectId: string;
    initialEstimates: EstimateMeta[];
};

export function ProjectEstimatesTable({ projectId, initialEstimates }: ProjectEstimatesTableProps) {
    const [estimates, setEstimates] = useState(initialEstimates);
    const [isPending, startTransition] = useTransition();

    const handleCreateEstimate = () => {
        startTransition(async () => {
            const created = await estimatesMockRepo.createEstimate(projectId);
            setEstimates((current) => [created, ...current]);
        });
    };

    return (
        <div className="space-y-4 px-4 lg:px-6">
            <div className="flex justify-end">
                <Button onClick={handleCreateEstimate} disabled={isPending}>
                    <Plus className="size-4" />
                    Создать смету
                </Button>
            </div>
            <EstimatesListTable estimates={estimates} />
        </div>
    );
}
