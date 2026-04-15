import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEstimateProcurementAction } from '@/app/actions/estimates/procurement';
import { EstimateProcurementService } from '@/lib/services/estimate-procurement.service';
import { success, error } from '@/lib/utils/result';

vi.mock('@/lib/services/estimate-procurement.service');
vi.mock('@/lib/data/db/queries', () => ({
    getUser: vi.fn(() => Promise.resolve({
        id: (1) as any, // DB uses number ids
        email: 'test@example.com',
        platformRole: 'user',
    })),
}));

vi.mock('@/lib/data/db/drizzle', () => ({
    db: {
        query: {
            teamMembers: {
                findFirst: vi.fn(() => Promise.resolve({
                    team: { id: 1, slug: 'team-1', name: 'Team 1' },
                    role: 'owner',
                })),
            },
        },
    },
    withTenantContext: vi.fn((_id, _role, handler) => handler()),
}));

vi.mock('@sentry/nextjs', () => ({
    setUser: vi.fn(),
    setTag: vi.fn(),
    captureException: vi.fn(),
}));

describe('getEstimateProcurementAction', () => {
    const estimateId = '00000000-0000-0000-0000-000000000000';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return success result from service', async () => {
        const mockData = [{ materialName: 'Test', plannedQty: 10 }] as any;
        vi.mocked(EstimateProcurementService.list).mockResolvedValue(success(mockData));

        const result = await getEstimateProcurementAction(estimateId);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(mockData);
        }
        expect(EstimateProcurementService.list).toHaveBeenCalledWith(1, estimateId);
    });

    it('should return error if service fails', async () => {
        vi.mocked(EstimateProcurementService.list).mockResolvedValue(error('Service error'));

        const result = await getEstimateProcurementAction(estimateId);

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.message).toBe('Service error');
        }
    });

    it('should validate input uuid', async () => {
        const result = await getEstimateProcurementAction('invalid-uuid');

        expect(result.success).toBe(false);
        if (!result.success) {
            // safeAction custom implementation returns INTERNAL_ERROR on catch
            expect(result.error.code).toBe('INTERNAL_ERROR');
        }
    });
});
