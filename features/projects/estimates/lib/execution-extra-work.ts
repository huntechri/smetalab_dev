import { CatalogWork } from '@/features/catalog/types/dto';

type ExtraWorkPayload = {
    name: string;
    code?: string;
    unit: string;
    actualQty: number;
    actualPrice: number;
};

export function buildExtraWorkFromCatalog(work: CatalogWork): ExtraWorkPayload {
    return {
        name: work.name,
        code: work.code || undefined,
        unit: work.unit || 'шт',
        actualQty: 1,
        actualPrice: Number.isFinite(work.price) ? work.price : 0,
    };
}
