import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MaterialSuppliersClient } from '@/features/material-suppliers';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';
import React from 'react';
import type { MaterialSupplier } from '@/lib/data/db/schema';

vi.mock('react-virtuoso', async () => {
  const mock = await import('../__mocks__/react-virtuoso');
  return mock;
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock('@/app/actions/material-suppliers', () => ({
  deleteMaterialSupplier: vi.fn(),
  createMaterialSupplier: vi.fn(),
  updateMaterialSupplier: vi.fn(),
}));

const mockData: MaterialSupplier[] = [{
  id: '1',
  name: 'ООО МеталлСнаб',
  color: '#3B82F6',
  legalStatus: 'company',
  inn: '1234567890',
  phone: '+7111',
  email: 'supplier@test.com',
  tenantId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  kpp: null,
  ogrn: null,
  address: null,
  bankAccount: null,
  bankName: null,
  corrAccount: null,
  bankInn: null,
  bankKpp: null,
  birthDate: null,
  passportSeriesNumber: null,
  passportIssuedBy: null,
  passportIssuedDate: null,
  departmentCode: null,
}];

describe('MaterialSuppliersClient', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  it('renders page title and add button', () => {
    render(<MaterialSuppliersClient initialData={[]} totalCount={0} tenantId={1} />);
    expect(screen.getByRole('heading', { name: 'Поставщики' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Добавить/i }).length).toBeGreaterThan(0);
  });

  it('renders suppliers data in table', () => {
    render(<MaterialSuppliersClient initialData={mockData} totalCount={1} tenantId={1} />);
    expect(screen.getByText('ООО МеталлСнаб')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
  });

  it('opens create sheet when add button is clicked', async () => {
    render(<MaterialSuppliersClient initialData={[]} totalCount={0} tenantId={1} />);
    fireEvent.click(screen.getAllByRole('button', { name: /Добавить/i })[0]);
    await waitFor(() => expect(screen.getByText('Создать поставщика')).toBeInTheDocument());
  });

  it('sets breadcrumb navigation', () => {
    render(<MaterialSuppliersClient initialData={[]} totalCount={0} tenantId={1} />);
    expect(useBreadcrumbs).toHaveBeenCalledWith([
      { label: 'Главная', href: '/app' },
      { label: 'Справочники' },
      { label: 'Поставщики' },
    ]);
  });
});
