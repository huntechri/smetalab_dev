'use client';

import { useMemo, useState } from 'react';
import { FilePlus } from 'lucide-react';

import { MoneyCell } from '@/shared/ui/cells/money-cell';
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/states';
import {
  EstimateTabActionsBar,
  EstimateTabCard,
  EstimateTabCodeText,
  EstimateTabEmptyState,
  EstimateTabInlineMetric,
  EstimateTabLoading,
  EstimateTabMetaWrap,
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
  EstimateTabStateMenu,
  EstimateTabTitleRow,
  EstimateTabToken,
  EstimateTabToolbar,
  EstimateTabTotalsBar,
  EstimateTabViewport,
} from '@/shared/ui/estimate-tab';
import { EstimateExecutionRow, EstimateExecutionStatus } from '@/shared/types/domain/estimate-execution';
import { parseDecimalInput } from '@/features/projects/estimates/lib/decimal-input';
import { useEstimateExecutionController } from '../../hooks/use-estimate-execution-controller';
import { EstimateTotals } from '../EstimateTotals';
import { EstimateInlineNumberCell } from '../table/cards/EstimateInlineNumberCell';
import { WORK_NUMBER_CLASS } from '../table/cards/constants';
import { EstimateExecutionAddExtraWorkSheet } from './execution/EstimateExecutionAddExtraWorkSheet';
import { EstimateExecutionTableActions } from './execution/EstimateExecutionTableActions';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
});

function ExecutionStateControl({
  currentState,
  onStateChange,
}: {
  currentState: EstimateExecutionStatus;
  onStateChange: (state: EstimateExecutionStatus) => void;
}) {
  return (
    <EstimateTabStateMenu
      currentState={currentState}
      onStateChange={(state) => onStateChange(state as EstimateExecutionStatus)}
    />
  );
}

export function EstimateExecution({ estimateId, initialRows }: { estimateId: string; initialRows?: EstimateExecutionRow[] }) {
  const {
    rows,
    isLoading,
    errorMessage,
    patchRow,
    addExtraWorkFromCatalog,
    handleExport,
    totals,
    addedWorkNames,
    reloadRows,
  } = useEstimateExecutionController({ estimateId, initialRows });

  const [searchValue, setSearchValue] = useState('');

  const filteredRows = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      row.name.toLowerCase().includes(query) ||
      row.unit.toLowerCase().includes(query) ||
      row.code?.toLowerCase().includes(query)
    );
  }, [rows, searchValue]);

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
      <EstimateTabRoot>
        <EstimateTabActionsBar>
          <EstimateExecutionAddExtraWorkSheet
            addedWorkNames={addedWorkNames}
            onAddWork={addExtraWorkFromCatalog}
          />
        </EstimateTabActionsBar>
        <EstimateTabEmptyState
          icon={<FilePlus aria-hidden="true" />}
          title="Список выполнения пуст"
          description="Для начала работы добавьте позиции во вкладку «Смета» или создайте дополнительную работу"
        />
      </EstimateTabRoot>
    );
  }

  return (
    <EstimateTabRoot>
      <EstimateTabPanel>
        <EstimateTabToolbar
          search={
            <EstimateTabSearchField
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Поиск..."
              ariaLabel="Поиск работ"
            />
          }
          actions={
            <EstimateExecutionTableActions
              addedWorkNames={addedWorkNames}
              onExport={handleExport}
              onAddWork={addExtraWorkFromCatalog}
            />
          }
        />

        <EstimateTabViewport>
          {filteredRows.length > 0 ? (
            <EstimateTabStack>
              {filteredRows.map((row) => (
                <EstimateTabCard key={row.id} layout="execution">
                  <EstimateTabPrimaryCell>
                    <EstimateTabTitleRow>
                      {row.code ? <EstimateTabCodeText>{row.code}</EstimateTabCodeText> : null}
                      <EstimateTabNameText title={row.name}>{row.name}</EstimateTabNameText>
                      <EstimateTabToken>{row.unit}</EstimateTabToken>
                    </EstimateTabTitleRow>

                    <EstimateTabMetaWrap>
                      {row.source === 'extra' ? (
                        <EstimateTabSourceToken>Доп. работа</EstimateTabSourceToken>
                      ) : null}
                      <ExecutionStateControl
                        currentState={row.status}
                        onStateChange={(status) => void patchRow(row.id, { status })}
                      />
                    </EstimateTabMetaWrap>
                  </EstimateTabPrimaryCell>

                  <EstimateTabMetricsLayout layout="execution">
                    <EstimateTabMetricSection tone="plan" title="План">
                      <EstimateTabMetricsWrap>
                        <EstimateTabMetric label="Кол-во" value={numberFormatter.format(row.plannedQty)} />
                        <EstimateTabMetric label="Цена" value={moneyFormatter.format(row.plannedPrice)} />
                        <EstimateTabMetric label="Итого" value={<MoneyCell value={row.plannedSum} />} tone="info" />
                      </EstimateTabMetricsWrap>
                    </EstimateTabMetricSection>

                    <EstimateTabMetricSection tone="fact" title="Факт">
                      <EstimateTabMetricsWrap>
                        <EstimateTabInlineMetric label="Кол-во">
                          <EstimateInlineNumberCell
                            value={row.actualQty}
                            onCommit={async (val) => {
                              const nextValue = parseDecimalInput(val);
                              if (Number.isFinite(nextValue) && nextValue >= 0 && nextValue !== row.actualQty) {
                                await patchRow(row.id, { actualQty: nextValue });
                              }
                            }}
                            ariaLabel={`Количество: ${row.name}`}
                            className={WORK_NUMBER_CLASS}
                          />
                        </EstimateTabInlineMetric>
                        <EstimateTabInlineMetric label="Цена" suffix="₽">
                          <EstimateInlineNumberCell
                            value={row.actualPrice}
                            onCommit={async (val) => {
                              const nextValue = parseDecimalInput(val);
                              if (Number.isFinite(nextValue) && nextValue >= 0 && nextValue !== row.actualPrice) {
                                await patchRow(row.id, { actualPrice: nextValue });
                              }
                            }}
                            ariaLabel={`Цена: ${row.name}`}
                            className={WORK_NUMBER_CLASS}
                          />
                        </EstimateTabInlineMetric>
                        <EstimateTabToken variant="success">
                          <MoneyCell value={row.actualSum} />
                        </EstimateTabToken>
                      </EstimateTabMetricsWrap>
                    </EstimateTabMetricSection>
                  </EstimateTabMetricsLayout>
                </EstimateTabCard>
              ))}
            </EstimateTabStack>
          ) : (
            <EstimateTabEmptyState icon={<FilePlus aria-hidden="true" />}>
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
