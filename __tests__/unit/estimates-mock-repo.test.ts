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



    it('adds section row for estimate', async () => {
        const section = await estimatesMockRepo.addSection('est-001', { code: '1', name: 'Черновые работы' });
        expect(section.kind).toBe('section');
        expect(section.name).toBe('Черновые работы');
    });

    it('adds work for estimate ids loaded from DB even when mock store is empty', async () => {
        const row = await estimatesMockRepo.addWork('db-estimate-42', {
            name: 'Очистка потолка',
            unit: 'м2',
            price: 230,
            qty: 1,
        });

        expect(row.kind).toBe('work');
        expect(row.name).toBe('Очистка потолка');

        const rows = await estimatesMockRepo.getEstimateRows('db-estimate-42');
        expect(rows).toHaveLength(1);
        expect(rows[0].id).toBe(row.id);
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
