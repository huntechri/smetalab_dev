import { EstimateRow } from '../types/dto';

export const SECTION_WITHOUT_GROUP_ID = '__no_section__';

export const getSectionTotals = (rows: EstimateRow[]): Map<string, number> => {
    const totalsBySection = new Map<string, number>();
    let currentSectionId = SECTION_WITHOUT_GROUP_ID;

    for (const row of rows.slice().sort((left, right) => left.order - right.order)) {
        if (row.kind === 'section') {
            currentSectionId = row.id;
            if (!totalsBySection.has(row.id)) {
                totalsBySection.set(row.id, 0);
            }
            continue;
        }

        if (row.kind === 'work' || row.kind === 'material') {
            const currentValue = totalsBySection.get(currentSectionId) ?? 0;
            totalsBySection.set(currentSectionId, currentValue + (row.sum || 0));
        }
    }

    return totalsBySection;
};
