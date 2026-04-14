import { EstimateRow } from '../types/dto';

export type SectionTotals = {
    works: number;
    materials: number;
    total: number;
};

export const SECTION_WITHOUT_GROUP_ID = '__no_section__';

export const getSectionTotals = (rows: EstimateRow[]): Map<string, SectionTotals> => {
    const totalsBySection = new Map<string, SectionTotals>();
    let currentSectionId = SECTION_WITHOUT_GROUP_ID;

    for (const row of rows.slice().sort((left, right) => left.order - right.order)) {
        if (row.kind === 'section') {
            currentSectionId = row.id;
            if (!totalsBySection.has(row.id)) {
                totalsBySection.set(row.id, { works: 0, materials: 0, total: 0 });
            }
            continue;
        }

        if (row.kind !== 'work' && row.kind !== 'material') {
            continue;
        }

        const currentTotals = totalsBySection.get(currentSectionId) ?? { works: 0, materials: 0, total: 0 };
        const nextTotals: SectionTotals = {
            works: row.kind === 'work' ? currentTotals.works + (row.sum || 0) : currentTotals.works,
            materials: row.kind === 'material' ? currentTotals.materials + (row.sum || 0) : currentTotals.materials,
            total: currentTotals.total + (row.sum || 0),
        };

        totalsBySection.set(currentSectionId, nextTotals);
    }

    return totalsBySection;
};
