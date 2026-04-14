import {
  applyEstimatePatternAction,
  createEstimatePatternAction,
  listEstimatePatternsAction,
  previewEstimatePatternAction,
  removeEstimatePatternAction,
} from '@/app/actions/estimates/patterns';

export type EstimatePatternListItem = {
  id: string;
  name: string;
  description: string | null;
  rowsCount: number;
  worksCount: number;
  materialsCount: number;
  updatedAt: Date;
};

export type EstimatePatternPreviewRow = {
  kind: 'section' | 'work' | 'material';
  parentWorkTempKey: string | null;
  tempKey: string;
  code: string;
  name: string;
  materialId: string | null;
  imageUrl: string | null;
  unit: string;
  qty: number;
  price: number;
  sum: number;
  expense: number;
  order: number;
};

export const estimatePatternsActionRepo = {
  async list(): Promise<EstimatePatternListItem[]> {
    const result = await listEstimatePatternsAction();
    if (!result.success) {
      throw new Error(result.error.message);
    }

    return result.data;
  },

  async create(payload: { estimateId: string; name: string; description?: string }): Promise<{ id: string }> {
    const result = await createEstimatePatternAction(payload);
    if (!result.success) {
      throw new Error(result.error.message);
    }

    return result.data;
  },

  async preview(patternId: string): Promise<{ id: string; name: string; rows: EstimatePatternPreviewRow[] }> {
    const result = await previewEstimatePatternAction(patternId);
    if (!result.success) {
      throw new Error(result.error.message);
    }

    return result.data;
  },

  async apply(payload: { estimateId: string; patternId: string }): Promise<{ appliedRows: number }> {
    const result = await applyEstimatePatternAction(payload);
    if (!result.success) {
      throw new Error(result.error.message);
    }

    return result.data;
  },

  async remove(patternId: string): Promise<{ id: string }> {
    const result = await removeEstimatePatternAction(patternId);
    if (!result.success) {
      throw new Error(result.error.message);
    }

    return result.data;
  },
};

