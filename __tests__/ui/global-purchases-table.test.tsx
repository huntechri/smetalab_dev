import type React from 'react';
import { GlobalPurchasesTable } from '@/features/global-purchases/components/GlobalPurchasesTable.client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const addManualRowMock = vi.fn();
const addCatalogRowMock = vi.fn();
const copyToNextDayMock = vi.fn();
const importRowsMock = vi.fn();

vi.mock('@/features/global-purchases/hooks/useGlobalPurchasesTable', () => ({
    useGlobalPurchasesTable: () => ({
        rows: [],
        range: { from: '2026-01-15', to: '2026-01-15' },
        setRange: vi.fn(),
        reloadRows: vi.fn().mockResolvedValue(undefined),
        addManualRow: addManualRowMock,
        addCatalogRow: addCatalogRowMock,
        updateRow: vi.fn().mockResolvedValue(undefined),
        removeRow: vi.fn().mockResolvedValue(undefined),
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

vi.mock('@repo/ui', () => ({
    DataTable: ({ actions }: { actions?: React.ReactNode }) => <div>{actions}</div>,
    Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Calendar: () => <div>calendar</div>,
    TableEmptyState: () => <div>empty</div>,
    Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
    Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Command: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CommandEmpty: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CommandGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CommandInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
    CommandItem: ({ children, onSelect }: { children: React.ReactNode; onSelect?: () => void }) => <div onClick={onSelect}>{children}</div>,
    CommandList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

describe('GlobalPurchasesTable', () => {
    it('adds manual and catalog rows without default project binding', async () => {
        addManualRowMock.mockResolvedValue(undefined);
        addCatalogRowMock.mockResolvedValue(undefined);

        render(
            <GlobalPurchasesTable
                initialRows={[]}
                initialRange={{ from: '2026-01-15', to: '2026-01-15' }}
                projectOptions={[{ id: 'project-1', name: 'ЖК Горизонт' }]}
                supplierOptions={[]}
            />,
        );

        expect(screen.queryByText('Объект по умолчанию')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Добавить строку вручную|Строка вручную/i }));
        fireEvent.click(screen.getByRole('button', { name: /Добавить из справочника|Из справочника/i })); // Click "Из справочника" to open dialog
        fireEvent.click(screen.getByRole('button', { name: /Выбрать материал/i })); // Click mock dialog select

        await waitFor(() => {
            expect(addManualRowMock).toHaveBeenCalledWith(null);
            expect(addCatalogRowMock).toHaveBeenCalledWith(expect.objectContaining({ name: 'Щебень' }), null);
        });
    });
});
