export type PurchaseRowSource = 'manual' | 'catalog';

export type PurchaseRow = {
    id: string;
    projectName: string;
    materialName: string;
    unit: string;
    qty: number;
    price: number;
    amount: number;
    note: string;
    source: PurchaseRowSource;
};

export type ProjectOption = {
    id: string;
    name: string;
};

export type PurchaseRowPatch = Partial<Pick<PurchaseRow, 'projectName' | 'materialName' | 'unit' | 'qty' | 'price' | 'note'>>;
