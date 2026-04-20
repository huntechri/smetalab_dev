import { saveEstimateRoomParamsAction } from '@/app/actions/estimates/room-params';
import { RoomParamSaveInput } from '../schemas/room-params.schema';

export const roomParamsActionsRepo = {
    async save(estimateId: string, rows: RoomParamSaveInput[]): Promise<{ count: number }> {
        const result = await saveEstimateRoomParamsAction(estimateId, rows);
        if (!result.success) {
            throw new Error(result.error.message);
        }
        return result.data;
    },
};
