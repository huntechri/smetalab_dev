import { initialEstimates, initialRowsByEstimateId } from '../mock/data';
import { delay } from '../mock/delay';
import { EstimateRow, estimateMetaSchema, estimateRowSchema, rowPatchSchema } from '../types/dto';
import { EstimatesRepository } from './estimates.repo';

const metaStore = new Map(initialEstimates.map((item) => [item.id, structuredClone(item)]));
const rowStore = new Map(Object.entries(initialRowsByEstimateId).map(([estimateId, rows]) => [estimateId, structuredClone(rows)]));

const recalculateTotals = (estimateId: string) => {
    const rows = rowStore.get(estimateId) ?? [];
    const total = rows.reduce((acc, row) => acc + row.sum, 0);
    const meta = metaStore.get(estimateId);

    if (meta) {
        meta.total = total;
        meta.updatedAt = new Date().toISOString();
    }
};

const getRowsOrCreate = (estimateId: string): EstimateRow[] => {
    const existingRows = rowStore.get(estimateId);
    if (existingRows) {
        return existingRows;
    }

    const emptyRows: EstimateRow[] = [];
    rowStore.set(estimateId, emptyRows);
    return emptyRows;
};

export const estimatesMockRepo: EstimatesRepository = {
    async listEstimates(projectId) {
        await delay(120, 360);
        return [...metaStore.values()].filter((item) => item.projectId === projectId).map((item) => estimateMetaSchema.parse(item));
    },
    async createEstimate(projectId, payload) {
        await delay(120, 320);
        const now = new Date().toISOString();
        const estimateId = `est-${crypto.randomUUID().slice(0, 8)}`;
        const name = payload?.name?.trim() ? payload.name.trim() : `Смета ${new Date().toLocaleDateString('ru-RU')}`;
        const estimate = estimateMetaSchema.parse({
            id: estimateId,
            projectId,
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'estimate',
            status: 'draft',
            total: 0,
            createdAt: now,
            updatedAt: now,
        });

        metaStore.set(estimateId, estimate);
        rowStore.set(estimateId, []);
        return estimate;
    },
    async getEstimateMeta(projectId, estimateId) {
        await delay(80, 220);
        const meta = metaStore.get(estimateId);
        if (!meta || meta.projectId !== projectId) {
            throw new Error('Estimate not found');
        }
        return estimateMetaSchema.parse(meta);
    },
    async getEstimateRows(estimateId) {
        await delay(300, 800);
        return getRowsOrCreate(estimateId)
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((row) => estimateRowSchema.parse(row));
    },
    async patchRow(estimateId, rowId, patch) {
        await delay(80, 250);
        const parsedPatch = rowPatchSchema.parse(patch);
        const rows = getRowsOrCreate(estimateId);
        const row = rows.find((item) => item.id === rowId);

        if (!row) {
            throw new Error('Row not found');
        }

        Object.assign(row, parsedPatch);
        row.sum = Number((row.qty * row.price).toFixed(2));
        recalculateTotals(estimateId);
        return estimateRowSchema.parse(row);
    },
    async addWork(estimateId, payload) {
        await delay(120, 320);
        const rows = getRowsOrCreate(estimateId);
        const maxOrder = Math.max(0, ...rows.map((row) => row.order));
        const nextCode = `${rows.filter((row) => row.kind === 'work').length + 1}`;
        const row: EstimateRow = {
            id: `w-${crypto.randomUUID().slice(0, 8)}`,
            kind: 'work',
            code: nextCode,
            name: payload?.name ?? 'Новая работа',
            unit: payload?.unit ?? 'шт',
            qty: payload?.qty ?? 1,
            price: payload?.price ?? 0,
            sum: (payload?.qty ?? 1) * (payload?.price ?? 0),
            expense: payload?.expense ?? 0,
            order: maxOrder + 100,
        };
        rows.push(row);
        recalculateTotals(estimateId);
        return estimateRowSchema.parse(row);
    },
    async addMaterial(estimateId, parentWorkId, payload) {
        await delay(120, 320);
        const rows = getRowsOrCreate(estimateId);
        const parent = rows.find((row) => row.id === parentWorkId && row.kind === 'work');

        if (!parent) {
            throw new Error('Parent work not found');
        }

        const childRows = rows.filter((row) => row.kind === 'material' && row.parentWorkId === parentWorkId).sort((a, b) => a.order - b.order);
        const order = childRows.length > 0 ? childRows[childRows.length - 1].order + 1 : parent.order + 1;

        rows.forEach((row) => {
            if (row.order >= order) {
                row.order += 1;
            }
        });

        const row: EstimateRow = {
            id: `m-${crypto.randomUUID().slice(0, 8)}`,
            kind: 'material',
            parentWorkId,
            code: `${parent.code}.${childRows.length + 1}`,
            name: payload?.name ?? 'Новый материал',
            unit: payload?.unit ?? 'шт',
            qty: payload?.qty ?? 1,
            price: payload?.price ?? 0,
            sum: (payload?.qty ?? 1) * (payload?.price ?? 0),
            expense: payload?.expense ?? 0,
            order,
        };

        rows.push(row);
        recalculateTotals(estimateId);
        return estimateRowSchema.parse(row);
    },
};
