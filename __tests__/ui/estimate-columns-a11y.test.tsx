import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EstimateCardsTable } from '@/features/projects/estimates/components/table/EstimateCardsTable';
import type { EstimateRow } from '@/shared/types/domain/estimate';
import type { SectionTotals } from '@/features/projects/estimates/lib/section-totals';

const noopPatch = vi.fn().mockResolvedValue(undefined);
const noopRemove = vi.fn().mockResolvedValue(undefined);

afterEach(() => {
  cleanup();
});

function buildRows(): EstimateRow[] {
  return [
    {
      id: 'section-12',
      kind: 'section',
      code: 'РАЗДЕЛ 12',
      name: 'Демонтажные работы',
      unit: '',
      qty: 0,
      price: 0,
      sum: 0,
      expense: 0,
      order: 10,
    },
    {
      id: 'work-1',
      kind: 'work',
      code: 'РАБОТА · 1',
      name: 'Демонтаж кирпичных стен в 1/2 кирпича',
      unit: 'м2',
      qty: 100,
      price: 340,
      sum: 34000,
      expense: 0,
      order: 11,
    },
    {
      id: 'material-1',
      kind: 'material',
      parentWorkId: 'work-1',
      code: '1.1',
      name: 'Штукатурка ротбанд Knauf 30кг',
      unit: 'Мш',
      qty: 1,
      price: 1000,
      sum: 1000,
      expense: 0.1,
      order: 12,
    },
    {
      id: 'material-2',
      kind: 'material',
      parentWorkId: 'work-1',
      code: '1.2',
      name: 'Грунтовка Ceresit CT17 10л',
      unit: 'Шт',
      qty: 4,
      price: 800,
      sum: 3200,
      expense: 0.1,
      order: 13,
    },
    {
      id: 'material-3',
      kind: 'material',
      parentWorkId: 'work-1',
      code: '1.3',
      name: 'Профиль CD 60×27×3000',
      unit: 'Шт',
      qty: 20,
      price: 95,
      sum: 1900,
      expense: 0.1,
      order: 14,
    },
  ];
}

function renderCards() {
  const sectionTotalsById = new Map<string, SectionTotals>([
    ['section-12', { works: 68300, materials: 4200, total: 72500 }],
  ]);

  return render(
    <EstimateCardsTable
      rows={buildRows()}
      expandedWorkIds={new Set(['work-1'])}
      sectionTotalsById={sectionTotalsById}
      searchValue=""
      onToggleExpand={vi.fn()}
      onPatch={noopPatch}
      onOpenMaterialCatalog={vi.fn()}
      onInsertWorkAfter={vi.fn()}
      onRequestCreateSection={vi.fn()}
      onRequestCreateSectionBefore={vi.fn()}
      onReplaceMaterial={vi.fn()}
      onReplaceWork={vi.fn()}
      onRemoveRow={noopRemove}
    />,
  );
}

describe('Estimate cards layout contract (screenshot baseline)', () => {
  it('renders section/work/material hierarchy with desktop visual tokens from the approved screenshot', () => {
    renderCards();

    const sectionChip = screen.getByText('РАЗДЕЛ 12').closest('[data-slot="badge"]');
    expect(sectionChip).toHaveAttribute('data-size', 'xs');

    expect(screen.getByText('Демонтажные работы')).toBeInTheDocument();

    expect(screen.getAllByText('Работы').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Материалы').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/68\s?300\s?₽/)).toBeInTheDocument();
    expect(screen.getByText(/4\s?200\s?₽/)).toBeInTheDocument();

    const workCode = screen.getByText('РАБОТА · 1');
    expect(workCode).toHaveClass('uppercase');
    expect(workCode).toHaveClass('text-muted-foreground');
    expect(screen.getByText('Демонтаж кирпичных стен в 1/2 кирпича')).toBeInTheDocument();
    expect(screen.getByText('м2')).toBeInTheDocument();
    expect(screen.getByText(/34\s?000\s?₽/)).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Количество: Демонтаж кирпичных стен в 1/2 кирпича' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Цена: Демонтаж кирпичных стен в 1/2 кирпича' }),
    ).toBeInTheDocument();

    const workTitleButton = screen.getByRole('button', {
      name: 'Наименование: Демонтаж кирпичных стен в 1/2 кирпича',
    });
    expect(workTitleButton).toHaveAttribute('data-slot', 'button');
    expect(workTitleButton).toHaveAttribute('data-variant', 'ghost');
    expect(workTitleButton).toHaveAttribute('data-size', 'sm');

    expect(screen.getByText('+ Материал')).toBeInTheDocument();
    expect(screen.getByText('+ Работа')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Действия с разделом' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Действия с работой' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Действия с материалом' }).length).toBeGreaterThanOrEqual(1);

    const materialsHeadings = screen.getAllByText('Материалы', { selector: 'p' });
    // The work section materials heading is the one with uppercase class
    const materialsHeading = materialsHeadings.find((el) => el.classList.contains('uppercase'));
    expect(materialsHeading).toBeDefined();
    expect(materialsHeading).toHaveClass('tracking-wide');
    expect(screen.getByText('1.1')).toBeInTheDocument();
    expect(screen.getAllByText(/1.*000/).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByRole('button', { name: `Расход: ${buildRows()[2].name}` }),
    ).toBeInTheDocument();
  });

  it('keeps action triad contract for work row controls from screenshot (tools + row menu)', () => {
    renderCards();

    const workTitleButton = screen.getByRole('button', {
      name: `Наименование: ${buildRows()[1].name}`,
    });
    expect(workTitleButton).toHaveAttribute('data-slot', 'button');
    expect(workTitleButton).toHaveAttribute('data-variant', 'ghost');

    expect(screen.getByText('+ Материал')).toBeInTheDocument();
    expect(screen.getByText('+ Работа')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Действия с работой' })).toBeInTheDocument();
  });
});

describe('Estimate cards mobile UI kit contract (CSS tokens)', () => {
  it('keeps cards stack rhythm and section card shell close to the provided mobile kit', () => {
    renderCards();

    const sectionCard = screen.getByText('Демонтажные работы').closest('[data-slot="card-shell"]');
    expect(sectionCard).not.toBeNull();
  });

  it('preserves compact typography markers and semantic shadcn badges for section/work numbering', () => {
    renderCards();

    const sectionChip = screen.getByText('РАЗДЕЛ 12').closest('[data-slot="badge"]');
    expect(sectionChip).toHaveAttribute('data-size', 'xs');
    expect(sectionChip).toHaveAttribute('data-variant', 'neutral');

    const workCode = screen.getByText('РАБОТА · 1');
    expect(workCode).toHaveClass('uppercase');
    expect(workCode).toHaveClass('text-muted-foreground');

    const workTitleButton = screen.getByRole('button', {
      name: 'Наименование: Демонтаж кирпичных стен в 1/2 кирпича',
    });
    expect(workTitleButton).toHaveAttribute('data-slot', 'button');
    expect(workTitleButton).toHaveAttribute('data-variant', 'ghost');
    const materialsLabels = screen.getAllByText('Материалы', {
      selector: 'p',
    });
    const materialsLabel = materialsLabels.find((el) => el.classList.contains('uppercase'));
    expect(materialsLabel).toBeDefined();
    expect(materialsLabel).toHaveClass('tracking-wide');
    expect(materialsLabel).toHaveClass('text-muted-foreground');
  });

  it('uses pill-style action controls for work metrics and expense editing, matching kit intent', () => {
    renderCards();

    const qtyButton = screen.getByRole('button', {
      name: 'Количество: Демонтаж кирпичных стен в 1/2 кирпича',
    });
    expect(qtyButton).toHaveAttribute('data-slot', 'button');
    expect(qtyButton).toHaveAttribute('data-variant', 'ghost');

    const expenseButton = screen.getByRole('button', {
      name: 'Расход: Штукатурка ротбанд Knauf 30кг',
    });
    expect(expenseButton).toHaveAttribute('data-slot', 'button');
    expect(expenseButton).toHaveAttribute('data-variant', 'ghost');
  });
});
