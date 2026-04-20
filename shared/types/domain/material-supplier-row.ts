export interface MaterialSupplierRow {
  id: string;
  name: string;
  color: string;
  legalStatus: 'individual' | 'company';

  birthDate?: string | null;
  passportSeriesNumber?: string | null;
  passportIssuedBy?: string | null;
  passportIssuedDate?: string | null;
  departmentCode?: string | null;

  ogrn?: string | null;
  inn?: string | null;
  kpp?: string | null;

  address?: string | null;
  phone?: string | null;
  email?: string | null;

  bankName?: string | null;
  bankAccount?: string | null;
  corrAccount?: string | null;
  bankInn?: string | null;
  bankKpp?: string | null;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
