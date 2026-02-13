import { describe, expect, it } from 'vitest';
import { estimatesMockRepo } from '@/features/projects/estimates/repository/estimates.mock';

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

    it('creates a draft estimate for the selected project', async () => {
        const created = await estimatesMockRepo.createEstimate('demo-project', { name: 'Смета на электрику' });
        expect(created.projectId).toBe('demo-project');
        expect(created.name).toBe('Смета на электрику');
        expect(created.status).toBe('draft');

        const list = await estimatesMockRepo.listEstimates('demo-project');
        expect(list.some((estimate) => estimate.id === created.id)).toBe(true);
    });
});
