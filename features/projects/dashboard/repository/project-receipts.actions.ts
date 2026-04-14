import {
  cancelProjectReceiptAction,
  createProjectReceiptAction,
  getProjectReceiptAggregatesAction,
  getProjectReceiptsAction,
  updateProjectReceiptAction,
} from '@/app/actions/project-receipts';
import type { ProjectReceiptAggregates, ProjectReceiptRow } from '@/shared/types/project-receipts';

export type ProjectReceiptPatch = Partial<Pick<ProjectReceiptRow, 'date' | 'amount' | 'type' | 'status' | 'comment' | 'source'>>;

export const projectReceiptsActionRepo = {
  async list(projectId: string): Promise<ProjectReceiptRow[]> {
    const result = await getProjectReceiptsAction(projectId);
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },

  async getAggregates(projectId: string): Promise<ProjectReceiptAggregates> {
    const result = await getProjectReceiptAggregatesAction(projectId);
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },

  async create(payload: {
    projectId: string;
    date: string;
    amount: number;
    type: ProjectReceiptRow['type'];
    status: ProjectReceiptRow['status'];
    comment: string;
    source: string | null;
  }): Promise<ProjectReceiptRow> {
    const result = await createProjectReceiptAction(payload);
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },

  async update(receiptId: string, patch: ProjectReceiptPatch): Promise<ProjectReceiptRow> {
    const result = await updateProjectReceiptAction(receiptId, patch);
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },

  async cancel(receiptId: string): Promise<ProjectReceiptRow> {
    const result = await cancelProjectReceiptAction(receiptId);
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
};
