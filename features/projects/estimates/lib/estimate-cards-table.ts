import type { EstimateRow } from '../types/dto';

export type WorkNode = {
  work: EstimateRow;
  materials: EstimateRow[];
};

export type SectionNode = {
  section: EstimateRow;
  works: WorkNode[];
};

export const DEFAULT_SECTION_ID = '__estimate-default-section__';

export const DEFAULT_SECTION_ROW: EstimateRow = {
  id: DEFAULT_SECTION_ID,
  kind: 'section',
  code: 'Без раздела',
  name: 'Общие работы',
  unit: '',
  qty: 0,
  price: 0,
  sum: 0,
  expense: 0,
  order: -1,
};

export function buildSectionNodes(rows: EstimateRow[]): SectionNode[] {
  const sortedRows = rows.slice().sort((a, b) => a.order - b.order);
  const sections: SectionNode[] = [];
  const workById = new Map<string, WorkNode>();
  let currentSection: SectionNode | null = null;

  for (const row of sortedRows) {
    if (row.kind === 'section') {
      currentSection = { section: row, works: [] };
      sections.push(currentSection);
      continue;
    }

    if (row.kind === 'work') {
      if (!currentSection) {
        currentSection = {
          section: { ...DEFAULT_SECTION_ROW },
          works: [],
        };
        sections.push(currentSection);
      }

      const workNode: WorkNode = { work: row, materials: [] };
      currentSection.works.push(workNode);
      workById.set(row.id, workNode);
    }
  }

  for (const row of sortedRows) {
    if (row.kind !== 'material' || !row.parentWorkId) {
      continue;
    }

    const parentWork = workById.get(row.parentWorkId);
    if (parentWork) {
      parentWork.materials.push(row);
    }
  }

  return sections;
}

export function matchesQuery(row: EstimateRow, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return (
    row.name.toLowerCase().includes(normalizedQuery) ||
    row.code.toLowerCase().includes(normalizedQuery) ||
    row.unit.toLowerCase().includes(normalizedQuery)
  );
}

export function filterSectionsByQuery(
  sectionNodes: SectionNode[],
  searchValue: string,
): SectionNode[] {
  const query = searchValue.trim();
  if (!query) {
    return sectionNodes;
  }

  return sectionNodes
    .map((sectionNode) => {
      const sectionMatches = matchesQuery(sectionNode.section, query);

      const works = sectionNode.works
        .map((workNode) => {
          const workMatches = matchesQuery(workNode.work, query);
          const matchingMaterials = workNode.materials.filter((material) =>
            matchesQuery(material, query),
          );

          if (sectionMatches || workMatches) {
            return workNode;
          }

          if (matchingMaterials.length > 0) {
            return {
              ...workNode,
              materials: matchingMaterials,
            };
          }

          return null;
        })
        .filter((workNode): workNode is WorkNode => Boolean(workNode));

      if (sectionMatches || works.length > 0) {
        return {
          section: sectionNode.section,
          works,
        };
      }

      return null;
    })
    .filter((sectionNode): sectionNode is SectionNode => Boolean(sectionNode));
}
