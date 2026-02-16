export type PurchaseRowSource = 'manual' | 'catalog';

export type PurchaseRow = {
    id: string;
    projectId: string | null;
    projectName: string;
    materialName: string;
    unit: string;
    qty: number;
    price: number;
    amount: number;
    note: string;
    source: PurchaseRowSource;
    purchaseDate: string;
};

export type ProjectOption = {
    id: string;
    name: string;
};

export type PurchaseRowPatch = Partial<Pick<PurchaseRow, 'projectId' | 'materialName' | 'unit' | 'qty' | 'price' | 'note' | 'purchaseDate'>>;

export type PurchaseRowsRange = {
    from: string;
    to: string;
};
