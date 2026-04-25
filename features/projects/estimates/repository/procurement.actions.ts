import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';

type ProcurementListResult =
    | { success: true; data: EstimateProcurementRow[] }
    | { success: false; error: { message: string; code?: string } };

export const estimateProcurementActionsRepo = {
    async list(estimateId: string): Promise<EstimateProcurementRow[]> {
        const response = await fetch(`/api/estimates/${estimateId}/procurement`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            cache: 'no-store',
        });

        const result = (await response.json()) as ProcurementListResult;

        if (!response.ok || !result.success) {
            throw new Error(result.success ? 'Не удалось загрузить закупки сметы' : result.error.message);
        }

        return result.data;
    },
};
