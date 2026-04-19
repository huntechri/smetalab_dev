import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getEstimateColumns } from '@/features/projects/estimates/components/table/columns';
import type { VisibleEstimateRow } from '@/features/projects/estimates/lib/rows-visible';
import type { CellContext, ColumnDef } from '@tanstack/react-table';

afterEach(() => {
    cleanup();
});

function makeCellContext(row: VisibleEstimateRow): CellContext<VisibleEstimateRow, unknown> {
    const mockRow = {
        original: row,
        getValue: (key: string) => row[key as keyof VisibleEstimateRow],
        getIsExpanded: () => false,
        subRows: [],
    };
    return {
        row: mockRow as unknown as CellContext<VisibleEstimateRow, unknown>['row'],
        getValue: () => undefined,
        renderValue: () => undefined,
        table: {} as CellContext<VisibleEstimateRow, unknown>['table'],
        column: {} as CellContext<VisibleEstimateRow, unknown>['column'],
        cell: {} as CellContext<VisibleEstimateRow, unknown>['cell'],
    };
}

const mockActions = {
    expandedWorkIds: new Set<string>(),
    onToggleExpand: vi.fn(),
    onPatch: vi.fn().mockResolvedValue(undefined),
    onOpenMaterialCatalog: vi.fn(),
    onInsertWorkAfter: vi.fn(),
    onRequestCreateSection: vi.fn(),
    onRequestCreateSectionBefore: vi.fn(),
    onReplaceMaterial: vi.fn(),
    onReplaceWork: vi.fn(),
    onRemoveRow: vi.fn().mockResolvedValue(undefined),
    sectionTotalsById: new Map(),
};

const workRow: VisibleEstimateRow = {
    id: 'w-1',
    kind: 'work',
    code: '1',
    name: 'Монтаж перегородок',
    unit: 'м2',
    qty: 40,
    price: 1200,
    sum: 48000,
    expense: 0,
    order: 100,
    depth: 1,
};

const materialRow: VisibleEstimateRow = {
    id: 'm-1',
    kind: 'material',
    parentWorkId: 'w-1',
    code: '1.1',
    name: 'ГКЛ лист 12.5мм',
    unit: 'лист',
    qty: 52,
    price: 520,
    sum: 27040,
    expense: 3,
    order: 101,
    depth: 2,
};

const sectionRow: VisibleEstimateRow = {
    id: 's-1',
    kind: 'section',
    code: 'I',
    name: 'Раздел 1',
    unit: '',
    qty: 0,
    price: 0,
    sum: 0,
    expense: 0,
    order: 0,
    depth: 0,
};

describe('Estimate table columns – actions cell aria-labels', () => {
    const columns = getEstimateColumns(mockActions);

    const actionsColumn = columns.find((c) => (c as ColumnDef<VisibleEstimateRow> & { id?: string }).id === 'actions')!;

    function renderActionsCell(row: VisibleEstimateRow) {
        const ctx = makeCellContext(row);
        const CellContent = () => <>{(actionsColumn.cell as (ctx: typeof ctx) => React.ReactNode)(ctx)}</>;
        render(<CellContent />);
    }

    it('work row exposes "Добавить материал" button with correct aria-label', () => {
        renderActionsCell(workRow);
        const btn = screen.getByRole('button', { name: 'Добавить материал' });
        expect(btn).toBeInTheDocument();
        expect(btn).toHaveAttribute('aria-label', 'Добавить материал');
    });

    it('work row exposes "Добавить работу ниже" button with correct aria-label', () => {
        renderActionsCell(workRow);
        const btn = screen.getByRole('button', { name: 'Добавить работу ниже' });
        expect(btn).toBeInTheDocument();
        expect(btn).toHaveAttribute('aria-label', 'Добавить работу ниже');
    });

    it('work row exposes "Действия с строкой" dropdown trigger with correct aria-label', () => {
        renderActionsCell(workRow);
        const btn = screen.getByRole('button', { name: 'Действия с строкой' });
        expect(btn).toBeInTheDocument();
        expect(btn).toHaveAttribute('aria-label', 'Действия с строкой');
    });

    it('material row does not expose "Добавить материал" or "Добавить работу ниже" buttons', () => {
        renderActionsCell(materialRow);
        expect(screen.queryByRole('button', { name: 'Добавить материал' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Добавить работу ниже' })).not.toBeInTheDocument();
    });

    it('material row exposes "Действия с строкой" dropdown trigger with correct aria-label', () => {
        renderActionsCell(materialRow);
        const btn = screen.getByRole('button', { name: 'Действия с строкой' });
        expect(btn).toBeInTheDocument();
        expect(btn).toHaveAttribute('aria-label', 'Действия с строкой');
    });

    it('section row does not expose "Добавить материал" or "Добавить работу ниже" buttons', () => {
        renderActionsCell(sectionRow);
        expect(screen.queryByRole('button', { name: 'Добавить материал' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Добавить работу ниже' })).not.toBeInTheDocument();
    });

    it('section row exposes "Действия с строкой" dropdown trigger with correct aria-label', () => {
        renderActionsCell(sectionRow);
        const btn = screen.getByRole('button', { name: 'Действия с строкой' });
        expect(btn).toBeInTheDocument();
        expect(btn).toHaveAttribute('aria-label', 'Действия с строкой');
    });
});

describe('Estimate table columns – editable cell aria-labels', () => {
    const columns = getEstimateColumns(mockActions);

    const findColumn = (key: string) =>
        columns.find((c) => (c as ColumnDef<VisibleEstimateRow> & { accessorKey?: string }).accessorKey === key)!;

    it('qty column button announces "Количество" and the row name', () => {
        const qtyColumn = findColumn('qty');
        const ctx = makeCellContext(workRow);
        const CellContent = () => <>{(qtyColumn.cell as (ctx: typeof ctx) => React.ReactNode)(ctx)}</>;
        render(<CellContent />);

        const button = screen.getByRole('button', { name: `Количество: ${workRow.name}` });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', `Количество: ${workRow.name}`);
    });

    it('price column button announces "Цена" and the row name', () => {
        const priceColumn = findColumn('price');
        const ctx = makeCellContext(workRow);
        const CellContent = () => <>{(priceColumn.cell as (ctx: typeof ctx) => React.ReactNode)(ctx)}</>;
        render(<CellContent />);

        const button = screen.getByRole('button', { name: `Цена: ${workRow.name}` });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', `Цена: ${workRow.name}`);
    });

    it('expense column button announces "Расход" and the row name for material rows', () => {
        const expenseColumn = findColumn('expense');
        const ctx = makeCellContext(materialRow);
        const CellContent = () => <>{(expenseColumn.cell as (ctx: typeof ctx) => React.ReactNode)(ctx)}</>;
        render(<CellContent />);

        const button = screen.getByRole('button', { name: `Расход: ${materialRow.name}` });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', `Расход: ${materialRow.name}`);
    });

    it('qty column button announces "Количество" and the material row name', () => {
        const qtyColumn = findColumn('qty');
        const ctx = makeCellContext(materialRow);
        const CellContent = () => <>{(qtyColumn.cell as (ctx: typeof ctx) => React.ReactNode)(ctx)}</>;
        render(<CellContent />);

        const button = screen.getByRole('button', { name: `Количество: ${materialRow.name}` });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', `Количество: ${materialRow.name}`);
    });

    it('price column button announces "Цена" and the material row name', () => {
        const priceColumn = findColumn('price');
        const ctx = makeCellContext(materialRow);
        const CellContent = () => <>{(priceColumn.cell as (ctx: typeof ctx) => React.ReactNode)(ctx)}</>;
        render(<CellContent />);

        const button = screen.getByRole('button', { name: `Цена: ${materialRow.name}` });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', `Цена: ${materialRow.name}`);
    });

    it('qty column renders no button for section rows', () => {
        const qtyColumn = findColumn('qty');
        const ctx = makeCellContext(sectionRow);
        const CellContent = () => <>{(qtyColumn.cell as (ctx: typeof ctx) => React.ReactNode)(ctx)}</>;
        render(<CellContent />);

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('expense column renders no button for work rows', () => {
        const expenseColumn = findColumn('expense');
        const ctx = makeCellContext(workRow);
        const CellContent = () => <>{(expenseColumn.cell as (ctx: typeof ctx) => React.ReactNode)(ctx)}</>;
        render(<CellContent />);

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
