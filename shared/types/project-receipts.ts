export type ProjectReceiptType =
  | 'advance'
  | 'stage_payment'
  | 'partial_payment'
  | 'final_payment'
  | 'additional_payment'
  | 'adjustment'
  | 'refund';

export type ProjectReceiptStatus = 'confirmed' | 'pending' | 'cancelled';

export interface ProjectReceiptRow {
  id: string;
  projectId: string;
  date: string;
  amount: number;
  type: ProjectReceiptType;
  status: ProjectReceiptStatus;
  comment: string;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectReceiptAggregates {
  totalConfirmedReceipts: number;
  confirmedCount: number;
  lastConfirmedReceiptDate: string | null;
  lastConfirmedReceiptAmount: number | null;
  hasCorrections: boolean;
}
