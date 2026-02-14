import { EstimateMeta, EstimateRow } from '../types/dto';

const now = new Date().toISOString();

export const initialEstimates: EstimateMeta[] = [
    {
        id: 'est-001',
        projectId: 'demo-project',
        name: 'Смета на черновые работы',
        slug: 'smeta-na-chernovye-raboty',
        status: 'in_progress',
        total: 310000,
        createdAt: now,
        updatedAt: now,
    },
    {
        id: 'est-002',
        projectId: 'demo-project',
        name: 'Смета на чистовую отделку',
        slug: 'smeta-na-chistovuyu-otdelku',
        status: 'draft',
        total: 145000,
        createdAt: now,
        updatedAt: now,
    },
];

export const initialRowsByEstimateId: Record<string, EstimateRow[]> = {
    'est-001': [
        { id: 'w-1', kind: 'work', code: '1', name: 'Монтаж перегородок', unit: 'м2', qty: 40, price: 1200, sum: 48000, expense: 3000, order: 100 },
        { id: 'm-1', kind: 'material', parentWorkId: 'w-1', code: '1.1', name: 'ГКЛ лист 12.5мм', unit: 'лист', qty: 52, price: 520, sum: 27040, expense: 0, order: 101 },
        { id: 'm-2', kind: 'material', parentWorkId: 'w-1', code: '1.2', name: 'Профиль направляющий', unit: 'шт', qty: 48, price: 260, sum: 12480, expense: 0, order: 102 },
        { id: 'w-2', kind: 'work', code: '2', name: 'Штукатурка стен', unit: 'м2', qty: 85, price: 900, sum: 76500, expense: 4500, order: 200 },
        { id: 'm-3', kind: 'material', parentWorkId: 'w-2', code: '2.1', name: 'Смесь штукатурная', unit: 'меш', qty: 60, price: 430, sum: 25800, expense: 0, order: 201 },
        { id: 'w-3', kind: 'work', code: '3', name: 'Стяжка пола', unit: 'м2', qty: 55, price: 1200, sum: 66000, expense: 7000, order: 300 },
    ],
    'est-002': [
        { id: 'w-4', kind: 'work', code: '1', name: 'Покраска стен', unit: 'м2', qty: 120, price: 550, sum: 66000, expense: 3000, order: 100 },
    ],
};
