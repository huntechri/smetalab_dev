'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button } from '@repo/ui';
import { EstimatesListTable } from '@/features/projects/estimates/components/registry/EstimatesListTable';
import { CreateEstimateDialog } from '@/features/projects/estimates/components/CreateEstimateDialog';
import { useRouter } from 'next/navigation';
import { TableEmptyState } from '@repo/ui';
import { FilePlus, Plus } from 'lucide-react';

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
            <div className="relative">
            <EstimatesListTable
                estimates={mappedEstimates}
                projectSlug={projectSlug}
                showSearch={false}
                tableMinWidth={0}
                height="430px"
                tableContainerClassName="rounded-[13.6px] border border-[#e4e4e7] bg-white text-[#09090b] shadow-none p-3 backdrop-blur-0 flex flex-col gap-3 leading-6 [&_th]:text-[12px] [&_th]:leading-6 [&_th_div]:text-[12px] [&_td]:leading-6 [&_td_div]:text-[12px]"
                createInBodyAction={
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        variant="outline"
                        size="icon-xs"
                        aria-label="+ Создать смету"
                        title="Создать смету"
                    >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                    </Button>
                }
                emptyState={
                    <TableEmptyState
                        title="Нет смет в проекте"
                        description="Создайте первую смету, чтобы начать работу"
                        icon={FilePlus}
                        action={
                            <Button
                                onClick={() => setIsDialogOpen(true)}
                                variant="brand"
                            >
                                Создать смету
                            </Button>
                        }
                    />
                }
            />
            </div>

            <CreateEstimateDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                projectId={projectId}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
