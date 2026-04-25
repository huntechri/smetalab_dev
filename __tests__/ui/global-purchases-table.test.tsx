import type React from 'react';
import { GlobalPurchasesView } from '@/features/global-purchases/components/GlobalPurchasesView.client';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PurchaseRow } from '@/features/global-purchases/types/dto';

const { MockButton } = vi.hoisted(() => ({
    MockButton: ({
        children,
        asChild: _asChild,
        ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) => <button {...props}>{children}</button>,
}));

const addManualRowMock = vi.fn();
const addCatalogRowMock = vi.fn();
const updateRowMock = vi.fn();
const removeRowMock = vi.fn();
const copyToNextDayMock = vi.fn();
const importRowsMock = vi.fn();
let mockRows: PurchaseRow[] = [];

vi.mock('@/features/global-purchases/hooks/useGlobalPurchasesTable', () => ({
    useGlobalPurchasesTable: () => ({
        rows: mockRows,
        range: { from: '2026-01-15', to: '2026-01-15' },
        setRange: vi.fn(),
        reloadRows: vi.fn().mockResolvedValue(undefined),
        addManualRow: addManualRowMock,
        addCatalogRow: addCatalogRowMock,
        updateRow: updateRowMock,
        removeRow: removeRowMock,
        importRows: importRowsMock,
        copyToNextDay: copyToNextDayMock,
        totals: { amount: 0 },
        addedMaterialNames: new Set<string>(),
        pendingIds: new Set<string>(),
    }),
}));

vi.mock('@/components/providers/use-app-toast', () => ({
    useAppToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/features/global-purchases/components/global-purchases-columns', () => ({
    getGlobalPurchasesColumns: () => [],
}));

vi.mock('@/shared/ui/data-table', () => ({
    DataTable: ({ actions, emptyState }: { actions?: React.ReactNode; emptyState?: React.ReactNode }) => <div>{actions}{emptyState}</div>,
}));

vi.mock('@/shared/ui/table-empty-state', () => ({
    TableEmptyState: ({ title, description, action }: { title?: string; description?: string; action?: React.ReactNode }) => (
        <div>
            {title ? <p>{title}</p> : null}
            {description ? <p>{description}</p> : null}
            {action}
        </div>
    ),
}));

vi.mock('@/shared/ui/button', () => ({
    Button: MockButton,
}));

vi.mock('@/shared/ui/badge', () => ({
    Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('@/shared/ui/popover', () => ({
    Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/shared/ui/calendar', () => ({
    Calendar: () => <div>calendar</div>,
}));

vi.mock('@/shared/ui/tooltip', () => ({
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/shared/ui/command', () => ({
    Command: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CommandEmpty: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CommandGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CommandInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
    CommandItem: ({ children, onSelect }: { children: React.ReactNode; onSelect?: () => void }) => <div onClick={onSelect}>{children}</div>,
    CommandList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/shared/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
        <button type="button" onClick={onClick}>
            {children}
        </button>
    ),
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/shared/ui/alert-dialog', () => ({
    AlertDialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AlertDialogAction: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
    AlertDialogCancel: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
    AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('@/features/catalog/components/MaterialCatalogDialog.client', () => ({
    MaterialCatalogDialog: ({ onSelect }: { onSelect: (material: { name: string; unit: string; price: string }) => Promise<void> }) => (
        <button
            type="button"
            onClick={() => {
                void onSelect({ name: 'Щебень', unit: 'м3', price: '1200' });
            }}
        >
            Выбрать материал
        </button>
    ),
}));

function renderView() {
    return render(
        <GlobalPurchasesView
            initialRows={[]}
            initialRange={{ from: '2026-01-15', to: '2026-01-15' }}
            projectOptions={[{ id: 'project-1', name: 'ЖК Горизонт' }]}
            supplierOptions={[{ id: 'supplier-1', name: 'Поставщик 1', color: '#64748b' }]}
        />,
    );
}

describe('GlobalPurchasesView', () => {
    beforeEach(() => {
        mockRows = [];
        addManualRowMock.mockReset();
        addCatalogRowMock.mockReset();
        updateRowMock.mockReset();
        removeRowMock.mockReset();
        importRowsMock.mockReset();
        copyToNextDayMock.mockReset();
    });

    it('adds manual and catalog rows without default project binding', async () => {
        addManualRowMock.mockResolvedValue(undefined);
        addCatalogRowMock.mockResolvedValue(undefined);

        renderView();

        expect(screen.queryByText('Объект по умолчанию')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Добавить строку вручную/i }));
        fireEvent.click(screen.getByRole('button', { name: /Добавить из справочника/i }));
        fireEvent.click(screen.getByRole('button', { name: /Выбрать материал/i }));

        await waitFor(() => {
            expect(addManualRowMock).toHaveBeenCalledWith(null);
            expect(addCatalogRowMock).toHaveBeenCalledWith(expect.objectContaining({ name: 'Щебень' }), null);
        });
    });

    it('renders purchase cards without exposing row source badges', () => {
        mockRows = [
            {
                id: 'purchase-1',
                projectId: 'project-1',
                projectName: 'ЖК Горизонт',
                materialName: 'Штукатурка Ротбанд',
                materialId: 'material-1',
                unit: 'меш',
                qty: 10,
                price: 500,
                amount: 5000,
                note: '',
                source: 'catalog',
                purchaseDate: '2026-01-15',
                supplierId: 'supplier-1',
                supplierName: 'Поставщик 1',
                supplierColor: '#64748b',
            },
        ];

        renderView();

        const card = screen.getByText('Штукатурка Ротбанд').closest('article');
        expect(card).not.toBeNull();
        const cardScope = within(card as HTMLElement);

        expect(cardScope.getByText('15.01.2026')).toBeInTheDocument();
        expect(cardScope.getByText('Штукатурка Ротбанд')).toBeInTheDocument();
        expect(cardScope.getAllByText('ЖК Горизонт').length).toBeGreaterThan(0);
        expect(cardScope.getAllByText('Поставщик 1').length).toBeGreaterThan(0);
        expect(cardScope.queryByText('Каталог')).not.toBeInTheDocument();
        expect(cardScope.queryByText('Ручная')).not.toBeInTheDocument();
    });

    it('shows search empty state when existing rows are filtered out', () => {
        mockRows = [
            {
                id: 'purchase-1',
                projectId: null,
                projectName: '',
                materialName: 'Цемент',
                materialId: null,
                unit: 'меш',
                qty: 1,
                price: 100,
                amount: 100,
                note: '',
                source: 'manual',
                purchaseDate: '2026-01-15',
                supplierId: null,
                supplierName: null,
                supplierColor: null,
            },
        ];

        renderView();

        const searchInput = screen.getAllByLabelText('Поиск...')[0];
        fireEvent.change(searchInput, {
            target: { value: 'штукатурка' },
        });

        expect(screen.getByText('По запросу ничего не найдено')).toBeInTheDocument();
        expect(screen.queryByText('В выбранном периоде нет данных. Добавьте закупку вручную или из справочника.')).not.toBeInTheDocument();
    });
});
