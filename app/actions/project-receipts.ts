'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { ProjectReceiptsService } from '@/lib/services/project-receipts.service';

export const getProjectReceiptsAction = safeAction(
  async ({ team }, projectId: string) => ProjectReceiptsService.listByProject(team.id, projectId),
  { name: 'getProjectReceiptsAction' },
);

export const getProjectReceiptAggregatesAction = safeAction(
  async ({ team }, projectId: string) => ProjectReceiptsService.getAggregatesByProject(team.id, projectId),
  { name: 'getProjectReceiptAggregatesAction' },
);

export const createProjectReceiptAction = safeAction(
  async ({ team }, payload: {
    projectId: string;
    date: string;
    amount: number;
    type: 'advance' | 'stage_payment' | 'partial_payment' | 'final_payment' | 'additional_payment' | 'adjustment' | 'refund';
    status: 'confirmed' | 'pending' | 'cancelled';
    comment?: string;
    source?: string | null;
  }) => ProjectReceiptsService.create(team.id, payload),
  { name: 'createProjectReceiptAction' },
);

export const updateProjectReceiptAction = safeAction(
  async ({ team }, receiptId: string, patch: {
    date?: string;
    amount?: number;
    type?: 'advance' | 'stage_payment' | 'partial_payment' | 'final_payment' | 'additional_payment' | 'adjustment' | 'refund';
    status?: 'confirmed' | 'pending' | 'cancelled';
    comment?: string;
    source?: string | null;
  }) => ProjectReceiptsService.update(team.id, receiptId, patch),
  { name: 'updateProjectReceiptAction' },
);

export const cancelProjectReceiptAction = safeAction(
  async ({ team }, receiptId: string) => ProjectReceiptsService.cancel(team.id, receiptId),
  { name: 'cancelProjectReceiptAction' },
);
