"use client";

import { useCallback, useEffect, useRef } from "react";

const DEFAULT_EXTERNAL_REFRESH_DEBOUNCE_MS = 750;
const DEFAULT_VISIBLE_TAB_REFRESH_MS = 5 * 60 * 1000;

type UseEstimateExternalRefreshParams = {
  onRefresh: () => void;
  subscribe: (callback: () => void) => Array<() => void>;
  debounceMs?: number;
  visibleIntervalMs?: number;
};

export function useEstimateExternalRefresh({
  onRefresh,
  subscribe,
  debounceMs = DEFAULT_EXTERNAL_REFRESH_DEBOUNCE_MS,
  visibleIntervalMs = DEFAULT_VISIBLE_TAB_REFRESH_MS,
}: UseEstimateExternalRefreshParams) {
  const lastExternalRefreshRef = useRef(0);

  const reloadAfterExternalChange = useCallback(() => {
    const now = Date.now();
    if (now - lastExternalRefreshRef.current < debounceMs) {
      return;
    }

    lastExternalRefreshRef.current = now;
    onRefresh();
  }, [debounceMs, onRefresh]);

  useEffect(() => {
    const unsubscribers = subscribe(reloadAfterExternalChange);

    const handleFocus = () => reloadAfterExternalChange();
    const handlePageShow = () => reloadAfterExternalChange();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        reloadAfterExternalChange();
      }
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        reloadAfterExternalChange();
      }
    }, visibleIntervalMs);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [reloadAfterExternalChange, subscribe, visibleIntervalMs]);
}
