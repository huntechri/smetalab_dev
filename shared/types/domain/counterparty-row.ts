export interface CounterpartyRow {
    id: string;
    name: string;
    type: 'customer' | 'contractor' | 'supplier';
    legalStatus: 'individual' | 'company';

    // Individual specific
    birthDate?: string | null;
    passportSeriesNumber?: string | null;
    passportIssuedBy?: string | null;
    passportIssuedDate?: string | null;
    departmentCode?: string | null;

    // Company specific
    ogrn?: string | null; // OGRN or OGRIP
    inn?: string | null;
    kpp?: string | null;

    // Contact
    address?: string | null;
    phone?: string | null;
    email?: string | null;

    // Bank Details
    bankName?: string | null;
    bankAccount?: string | null;
    corrAccount?: string | null;
    bankInn?: string | null;
    bankKpp?: string | null;

    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
