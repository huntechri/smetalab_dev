'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { EstimatesListTable } from '@/features/projects/estimates/components/registry/EstimatesListTable';
import { CreateEstimateDialog } from '@/features/projects/estimates/components/CreateEstimateDialog';
import { useRouter } from 'next/navigation';
import { TableEmptyState } from '@/shared/ui/table-empty-state';
import { FilePlus } from 'lucide-react';

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
        <div className="space-y-4">
            <EstimatesListTable
                estimates={mappedEstimates}
                projectSlug={projectSlug}
                emptyState={
                    <TableEmptyState
                        title="Нет смет в проекте"
                        description="Создайте первую смету, чтобы начать работу"
                        icon={FilePlus}
                        action={
                            <Button
                                onClick={() => setIsDialogOpen(true)}
                                variant="standard"
                                className="h-8 rounded-[7.6px] px-6"
                            >
                                Создать смету
                            </Button>
                        }
                    />
                }
                actions={
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        variant="standard"
                        className="w-full sm:w-auto"
                    >
                        Создать смету
                    </Button>
                }
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
