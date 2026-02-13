import { describe, expect, it } from 'vitest';
import { estimatesMockRepo } from '@/features/projects/estimates/api/estimates.mock';

describe('estimatesMockRepo', () => {
    it('patches a row and recalculates sum', async () => {
        const updated = await estimatesMockRepo.patchRow('est-001', 'w-1', { qty: 10, price: 100 });
        expect(updated.sum).toBe(1000);
    });

    it('adds material under work and keeps parent relation', async () => {
        const material = await estimatesMockRepo.addMaterial('est-001', 'w-1', { name: 'new material' });
        expect(material.parentWorkId).toBe('w-1');
        expect(material.kind).toBe('material');
    });
});
