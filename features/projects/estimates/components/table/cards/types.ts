import type { SectionTotals } from '../../../lib/section-totals';
import type { EstimateRow } from '../../../types/dto';

export interface EstimateCardsTableProps {
  rows: EstimateRow[];
  expandedWorkIds: Set<string>;
  sectionTotalsById: Map<string, SectionTotals>;
  searchValue: string;
  onToggleExpand: (workId: string) => void;
  onPatch: (
    rowId: string,
    field: 'name' | 'qty' | 'price' | 'expense',
    rawValue: string,
  ) => Promise<void>;
  onOpenMaterialCatalog: (workId: string, workName: string) => void;
  onInsertWorkAfter: (workId: string, workName: string) => void;
  onRequestCreateSection: (insertAfterRowId?: string) => void;
  onRequestCreateSectionBefore: (insertBeforeRowId: string) => void;
  onReplaceMaterial: (materialId: string, materialName: string) => void;
  onReplaceWork: (workId: string, workName: string) => void;
  onRemoveRow: (rowId: string) => Promise<void>;
}
