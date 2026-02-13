import { EstimatesRegistryScreen, estimatesMockRepo } from '@/features/projects';

type PageProps = {
    params: Promise<{ projectId: string }>;
};

export default async function Page({ params }: PageProps) {
    const { projectId } = await params;
    const estimates = await estimatesMockRepo.listEstimates(projectId);

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-6 py-4">
            <h1 className="text-2xl font-semibold">Реестр смет</h1>
            <EstimatesRegistryScreen estimates={estimates} />
        </div>
    );
}
