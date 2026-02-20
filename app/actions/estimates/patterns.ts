'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { EstimatePatternsService } from '@/lib/services/estimate-patterns.service';

export const listEstimatePatternsAction = safeAction(
  async ({ team }) => EstimatePatternsService.list(team.id),
  { name: 'listEstimatePatternsAction' },
);

export const createEstimatePatternAction = safeAction(
  async ({ team }, payload: { estimateId: string; name: string; description?: string }) =>
    EstimatePatternsService.create(team.id, payload),
  { name: 'createEstimatePatternAction' },
);

export const previewEstimatePatternAction = safeAction(
  async ({ team }, patternId: string) => EstimatePatternsService.preview(team.id, patternId),
  { name: 'previewEstimatePatternAction' },
);

export const applyEstimatePatternAction = safeAction(
  async ({ team }, payload: { estimateId: string; patternId: string }) =>
    EstimatePatternsService.apply(team.id, payload),
  { name: 'applyEstimatePatternAction' },
);

export const removeEstimatePatternAction = safeAction(
  async ({ team }, patternId: string) => EstimatePatternsService.remove(team.id, patternId),
  { name: 'removeEstimatePatternAction' },
);

