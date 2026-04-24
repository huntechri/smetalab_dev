'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { estimateProcurementActionsRepo } from '@/features/projects/estimates/repository/procurement.actions';
import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';

interface UseEstimateProcurementControllerParams {
  estimateId: string;
  initialRows?: EstimateProcurementRow[];
}

export function useEstimateProcurementController({ estimateId, initialRows }: UseEstimateProcurementControllerParams) {
  const [rows, setRows] = useState<EstimateProcurementRow[]>(() => initialRows ?? []);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(() => initialRows === undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRows = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await estimateProcurementActionsRepo.list(estimateId);
      setRows(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Не удалось загрузить закупки сметы');
    } finally {
      setIsLoading(false);
    }
  }, [estimateId]);

  useEffect(() => {
    if (initialRows !== undefined) {
      setRows(initialRows);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    void loadRows();
  }, [initialRows, loadRows]);

  const totals = useMemo(
    () => rows.reduce((acc, row) => {
      acc.planned += row.plannedAmount;
      acc.actual += row.actualAmount;
      return acc;
    }, { planned: 0, actual: 0 }),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return rows;
    }

    return rows.filter((row) => row.materialName.toLowerCase().includes(query) || row.unit.toLowerCase().includes(query));
  }, [rows, searchValue]);

  const handleExport = useCallback(() => {
    window.open(`/api/estimates/${estimateId}/export/procurement`, '_blank', 'noopener,noreferrer');
  }, [estimateId]);

  return {
    rows,
    searchValue,
    setSearchValue,
    isLoading,
    errorMessage,
    totals,
    filteredRows,
    handleExport,
    reloadRows: loadRows,
  };
}

export type EstimateProcurementControllerModel = ReturnType<typeof useEstimateProcurementController>;
