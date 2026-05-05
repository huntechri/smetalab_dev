'use client';

import { PackageSearch } from 'lucide-react';

import { MoneyCell } from '@/shared/ui/cells/money-cell';
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/states';
import { Badge } from '@/shared/ui/badge';
import {
  EstimateTabCard,
  EstimateTabEmptyState,
  EstimateTabExportButton,
  EstimateTabLoading,
  EstimateTabMessage,
  EstimateTabMetricSection,
  EstimateTabMetricsLayout,
  EstimateTabMetricsWrap,
  EstimateTabNameText,
  EstimateTabPanel,
  EstimateTabPrimaryCell,
  EstimateTabRoot,
  EstimateTabSearchField,
  EstimateTabStack,
  EstimateTabTitleRow,
  EstimateTabToolbar,
  EstimateTabTotalsBar,
  EstimateTabViewport,
} from '@/shared/ui/estimate-tab';
import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';
import { useEstimateProcurementController } from '@/features/projects/estimates/hooks/use-estimate-procurement-controller';
import { EstimateTotals } from '../EstimateTotals';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
});

function formatDelta(value: number, formatter: Intl.NumberFormat) {
  return `${value > 0 ? '+' : ''}${formatter.format(value)}`;
}

function getDeltaTone(value: number): 'neutral' | 'success' | 'danger' {
  if (value > 0) return 'success';
  if (value < 0) return 'danger';
  return 'neutral';
}

function ProcurementToolbar({
  searchValue,
  onSearchValueChange,
  onExport,
}: {
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onExport: () => void;
}) {
  return (
    <EstimateTabToolbar
      search={
        <EstimateTabSearchField
          value={searchValue}
          onChange={(event) => onSearchValueChange(event.target.value)}
          placeholder="Поиск..."
          ariaLabel="Поиск закупок"
        />
      }
      actions={<EstimateTabExportButton onClick={onExport}>Экспорт Excel</EstimateTabExportButton>}
    />
  );
}

function ProcurementCard({ row }: { row: EstimateProcurementRow }) {
  return (
    <EstimateTabCard layout="procurement">
      <EstimateTabPrimaryCell>
        <EstimateTabTitleRow>
          <EstimateTabNameText title={row.materialName}>{row.materialName}</EstimateTabNameText>
          <Badge size="xs" variant="neutral">{row.unit}</Badge>
        </EstimateTabTitleRow>

        {row.source === 'fact_only' ? (
          <Badge size="xs" variant="warning">Только факт</Badge>
        ) : null}
      </EstimateTabPrimaryCell>

      <EstimateTabMetricsLayout layout="procurement">
        <EstimateTabMetricSection tone="plan" title="План">
          <EstimateTabMetricsWrap>
            <Badge size="xs" variant="neutral" className="tabular-nums">
              <span className="shrink-0 opacity-70">Кол-во:</span>
              <span className="ml-0.5">{numberFormatter.format(row.plannedQty)}</span>
            </Badge>
            <Badge size="xs" variant="neutral" className="tabular-nums">
              <span className="shrink-0 opacity-70">Цена:</span>
              <span className="ml-0.5">{moneyFormatter.format(row.plannedPrice)}</span>
            </Badge>
            <Badge size="xs" variant="info" className="tabular-nums">
              <span className="shrink-0 opacity-70">Итого:</span>
              <span className="ml-0.5"><MoneyCell value={row.plannedAmount} /></span>
            </Badge>
          </EstimateTabMetricsWrap>
        </EstimateTabMetricSection>

        <EstimateTabMetricSection tone="fact" title="Факт">
          <EstimateTabMetricsWrap>
            <Badge size="xs" variant="neutral" className="tabular-nums">
              <span className="shrink-0 opacity-70">Кол-во:</span>
              <span className="ml-0.5">{numberFormatter.format(row.actualQty)}</span>
            </Badge>
            <Badge size="xs" variant="neutral" className="tabular-nums">
              <span className="shrink-0 opacity-70">Цена:</span>
              <span className="ml-0.5">{moneyFormatter.format(row.actualAvgPrice)}</span>
            </Badge>
            <Badge size="xs" variant="success" className="tabular-nums">
              <span className="shrink-0 opacity-70">Итого:</span>
              <span className="ml-0.5"><MoneyCell value={row.actualAmount} /></span>
            </Badge>
          </EstimateTabMetricsWrap>
        </EstimateTabMetricSection>

        <EstimateTabMetricSection tone="delta" title="Откл.">
          <EstimateTabMetricsWrap>
            <Badge size="xs" variant={getDeltaTone(row.qtyDelta)} className="tabular-nums">
              <span className="shrink-0 opacity-70">Кол-во:</span>
              <span className="ml-0.5">{formatDelta(row.qtyDelta, numberFormatter)}</span>
            </Badge>
            <Badge size="xs" variant={getDeltaTone(row.amountDelta)} className="tabular-nums">
              <span className="shrink-0 opacity-70">Итого:</span>
              <span className="ml-0.5">{formatDelta(row.amountDelta, moneyFormatter)}</span>
            </Badge>
          </EstimateTabMetricsWrap>
        </EstimateTabMetricSection>
      </EstimateTabMetricsLayout>
    </EstimateTabCard>
  );
}

function buildProcurementRowKey(row: EstimateProcurementRow, index: number) {
  return `${row.materialName}-${row.unit}-${row.source}-${row.purchaseCount}-${row.lastPurchaseDate ?? 'none'}-${index}`;
}

export function EstimateProcurement({ estimateId, initialRows }: { estimateId: string; initialRows?: EstimateProcurementRow[] }) {
  const {
    rows,
    searchValue,
    setSearchValue,
    isLoading,
    errorMessage,
    totals,
    filteredRows,
    handleExport,
    reloadRows,
  } = useEstimateProcurementController({ estimateId, initialRows });

  if (isLoading) {
    return <EstimateTabLoading />;
  }

  if (errorMessage) {
    return (
      <ErrorState
        title="Ошибка загрузки"
        description={errorMessage}
        action={
          <Button type="button" onClick={() => reloadRows()}>
            Повторить
          </Button>
        }
      />
    );
  }

  if (rows.length === 0) {
    return (
      <EstimateTabMessage>
        В смете и закупках нет материалов для отображения.
      </EstimateTabMessage>
    );
  }

  return (
    <EstimateTabRoot>
      <EstimateTabPanel>
        <ProcurementToolbar
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
          onExport={handleExport}
        />

        <EstimateTabViewport>
          {filteredRows.length > 0 ? (
            <EstimateTabStack>
              {filteredRows.map((row, index) => (
                <ProcurementCard key={buildProcurementRowKey(row, index)} row={row} />
              ))}
            </EstimateTabStack>
          ) : (
            <EstimateTabEmptyState icon={<PackageSearch aria-hidden="true" />}>
              По вашему запросу ничего не найдено.
            </EstimateTabEmptyState>
          )}
        </EstimateTabViewport>
      </EstimateTabPanel>

      <EstimateTabTotalsBar>
        <EstimateTotals planned={totals.planned} actual={totals.actual} />
      </EstimateTabTotalsBar>
    </EstimateTabRoot>
  );
}
