'use server';

import { safeAction } from '@/lib/actions/safe-action';
import { EstimateRoomParamsService } from '@/lib/services/estimate-room-params.service';
import type { RoomParamSaveInput } from '@/features/projects';

export const getEstimateRoomParamsAction = safeAction(
    async ({ team }, estimateId: string) => EstimateRoomParamsService.list(team.id, estimateId),
    { name: 'getEstimateRoomParamsAction' },
);

export const saveEstimateRoomParamsAction = safeAction(
    async ({ team }, estimateId: string, rows: RoomParamSaveInput[]) => EstimateRoomParamsService.save(team.id, estimateId, rows),
    { name: 'saveEstimateRoomParamsAction' },
);
