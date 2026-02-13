import { EstimateDetailsShell, EstimateHeader, estimatesMockRepo } from '@/features/projects';
import { notFound } from 'next/navigation';

type PageProps = {
    params: Promise<{ projectId: string; estimateId: string }>;
};

export default async function Page({ params }: PageProps) {
    const { projectId, estimateId } = await params;

    try {
        const meta = await estimatesMockRepo.getEstimateMeta(projectId, estimateId);
        const rowsPromise = estimatesMockRepo.getEstimateRows(estimateId);

        return (
            <div className="mx-auto w-full max-w-[1600px] space-y-6 py-4">
                <EstimateHeader meta={meta} />
                <EstimateDetailsShell estimateId={estimateId} rowsPromise={rowsPromise} />
            </div>
        );
    } catch {
        notFound();
    }
}
