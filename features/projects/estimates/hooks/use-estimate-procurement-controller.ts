'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addEstimatePurchasesMutatedListener, addEstimateRowsMutatedListener } from '@/features/projects/estimates/lib/estimate-client-events';
import { estimateProcurementActionsRepo } from '@/features/projects/estimates/repository/procurement.actions';
import type { EstimateProcurementRow } from '@/shared/types/estimate-procurement';

interface UseEstimateProcurementControllerParams {
  estimateId: string;
  initialRows?: EstimateProcurementRow[];
}

const EXTERNAL_REFRESH_DEBOUNCE_MS = 750;
const VISIBLE_TAB_REFRESH_MS = 5 * 60 * 1000;

export function useEstimateProcurementController({ estimateId, initialRows }: UseEstimateProcurementControllerParams) {
  const [rows, setRows] = useState<EstimateProcurementRow[]>(() => initialRows ?? []);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(() => initialRows === undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastExternalRefreshRef = useRef(0);

  const loadRows = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }

      setErrorMessage(null);
      const data = await estimateProcurementActionsRepo.list(estimateId);
      setRows(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Не удалось загрузить закупки сметы');
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [estimateId]);

  const reloadAfterExternalChange = useCallback(() => {
    const now = Date.now();
    if (now - lastExternalRefreshRef.current < EXTERNAL_REFRESH_DEBOUNCE_MS) {
      return;
    }

    lastExternalRefreshRef.current = now;
    void loadRows(true);
  }, [loadRows]);

  useEffect(() => {
    if (initialRows !== undefined) {
      setRows(initialRows);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    void loadRows();
  }, [initialRows, loadRows]);

  useEffect(() => {
    const unsubscribeRows = addEstimateRowsMutatedListener(estimateId, reloadAfterExternalChange);
    const unsubscribePurchases = addEstimatePurchasesMutatedListener(estimateId, reloadAfterExternalChange);

    const handleFocus = () => reloadAfterExternalChange();
    const handlePageShow = () => reloadAfterExternalChange();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        reloadAfterExternalChange();
      }
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        reloadAfterExternalChange();
      }
    }, VISIBLE_TAB_REFRESH_MS);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribeRows();
      unsubscribePurchases();
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [estimateId, reloadAfterExternalChange]);

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
