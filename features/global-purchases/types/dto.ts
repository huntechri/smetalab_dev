export type PurchaseRowSource = 'manual' | 'catalog';

export type SupplierOption = {
  id: string;
  name: string;
  color: string;
};

export type PurchaseRow = {
  id: string;
  projectId: string | null;
  projectName: string;
  materialName: string;
  materialId?: string | null;
  unit: string;
  qty: number;
  price: number;
  amount: number;
  note: string;
  source: PurchaseRowSource;
  purchaseDate: string;
  supplierId: string | null;
  supplierName: string | null;
  supplierColor: string | null;
};

export type ProjectOption = {
  id: string;
  name: string;
};

export type PurchaseRowPatch = Partial<Pick<PurchaseRow, 'projectId' | 'materialName' | 'materialId' | 'unit' | 'qty' | 'price' | 'note' | 'purchaseDate' | 'supplierId'>>;

export type PurchaseRowsRange = {
  from: string;
  to: string;
};


export type PurchaseRowBatchPatchPayload = {
  updates: Array<{
    rowId: string;
    patch: PurchaseRowPatch;
  }>;
};
