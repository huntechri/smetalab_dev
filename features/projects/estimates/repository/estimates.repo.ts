import { EstimateMeta, EstimateRow, RowPatch } from '../types/dto';

export interface EstimatesRepository {
    listEstimates(projectId: string): Promise<EstimateMeta[]>;
    createEstimate(projectId: string, payload?: { name?: string }): Promise<EstimateMeta>;
    getEstimateMeta(projectId: string, estimateId: string): Promise<EstimateMeta>;
    getEstimateRows(estimateId: string): Promise<EstimateRow[]>;
    patchRow(estimateId: string, rowId: string, patch: RowPatch): Promise<EstimateRow>;
    addWork(estimateId: string, payload?: Partial<Pick<EstimateRow, 'name' | 'materialId' | 'unit' | 'qty' | 'price' | 'expense'>>): Promise<EstimateRow>;
    addMaterial(
        estimateId: string,
        parentWorkId: string,
        payload?: Partial<Pick<EstimateRow, 'name' | 'materialId' | 'unit' | 'qty' | 'price' | 'expense'>>,
    ): Promise<EstimateRow>;
}
