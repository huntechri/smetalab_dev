'use client';

import { PackageSearch } from 'lucide-react';

import { MoneyCell } from '@/shared/ui/cells/money-cell';
import {
  EstimateTabCard,
  EstimateTabEmptyState,
  EstimateTabError,
  EstimateTabExportButton,
  EstimateTabLoading,
  EstimateTabMessage,
  EstimateTabMetric,
  EstimateTabMetricSection,
  EstimateTabMetricsLayout,
  EstimateTabMetricsWrap,
  EstimateTabNameText,
  EstimateTabPanel,
  EstimateTabPrimaryCell,
  EstimateTabRoot,
  EstimateTabSearchField,
  EstimateTabSourceToken,
  EstimateTabStack,
  EstimateTabTitleRow,
  EstimateTabToken,
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
          <EstimateTabToken>{row.unit}</EstimateTabToken>
        </EstimateTabTitleRow>

        {row.source === 'fact_only' ? (
          <EstimateTabSourceToken>Только факт</EstimateTabSourceToken>
        ) : null}
      </EstimateTabPrimaryCell>

      <EstimateTabMetricsLayout layout="procurement">
        <EstimateTabMetricSection tone="plan" title="План">
          <EstimateTabMetricsWrap>
            <EstimateTabMetric label="Кол-во" value={numberFormatter.format(row.plannedQty)} />
            <EstimateTabMetric label="Цена" value={moneyFormatter.format(row.plannedPrice)} />
            <EstimateTabMetric label="Итого" value={<MoneyCell value={row.plannedAmount} />} tone="info" />
          </EstimateTabMetricsWrap>
        </EstimateTabMetricSection>

        <EstimateTabMetricSection tone="fact" title="Факт">
          <EstimateTabMetricsWrap>
            <EstimateTabMetric label="Кол-во" value={numberFormatter.format(row.actualQty)} />
            <EstimateTabMetric label="Цена" value={moneyFormatter.format(row.actualAvgPrice)} />
            <EstimateTabMetric label="Итого" value={<MoneyCell value={row.actualAmount} />} tone="success" />
          </EstimateTabMetricsWrap>
        </EstimateTabMetricSection>

        <EstimateTabMetricSection tone="delta" title="Откл.">
          <EstimateTabMetricsWrap>
            <EstimateTabMetric
              label="Кол-во"
              value={formatDelta(row.qtyDelta, numberFormatter)}
              tone={getDeltaTone(row.qtyDelta)}
            />
            <EstimateTabMetric
              label="Итого"
              value={formatDelta(row.amountDelta, moneyFormatter)}
              tone={getDeltaTone(row.amountDelta)}
            />
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
  } = useEstimateProcurementController({ estimateId, initialRows });

  if (isLoading) {
    return <EstimateTabLoading />;
  }

  if (errorMessage) {
    return <EstimateTabError>{errorMessage}</EstimateTabError>;
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
