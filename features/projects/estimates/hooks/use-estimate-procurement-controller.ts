'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { estimateProcurementActionsRepo } from '@/features/projects/estimates/repository/procurement.actions';
import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';

interface UseEstimateProcurementControllerParams {
  estimateId: string;
}

export function useEstimateProcurementController({ estimateId }: UseEstimateProcurementControllerParams) {
  const [rows, setRows] = useState<EstimateProcurementRow[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadRows = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const data = await estimateProcurementActionsRepo.list(estimateId);

        if (!active) {
          return;
        }

        setRows(data);
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Не удалось загрузить закупки сметы');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadRows();

    return () => {
      active = false;
    };
  }, [estimateId]);

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
  };
}

export type EstimateProcurementControllerModel = ReturnType<typeof useEstimateProcurementController>;
