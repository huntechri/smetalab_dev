export interface EstimateProcurementRow {
  materialName: string;
  unit: string;
  source: 'estimate' | 'fact_only';
  plannedQty: number;
  plannedPrice: number;
  plannedAmount: number;
  actualQty: number;
  actualAvgPrice: number;
  actualAmount: number;
  qtyDelta: number;
  amountDelta: number;
  purchaseCount: number;
  lastPurchaseDate: string | null;
}
