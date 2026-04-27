"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_REFRESH_DEBOUNCE_MS = 750;
const DEFAULT_VISIBLE_INTERVAL_MS = 5 * 60 * 1000;

type UseVisibleRouteRefreshOptions = {
  enabled?: boolean;
  debounceMs?: number;
  visibleIntervalMs?: number;
};

export function useVisibleRouteRefresh({
  enabled = true,
  debounceMs = DEFAULT_REFRESH_DEBOUNCE_MS,
  visibleIntervalMs = DEFAULT_VISIBLE_INTERVAL_MS,
}: UseVisibleRouteRefreshOptions = {}) {
  const router = useRouter();
  const lastRefreshRef = useRef(0);

  const refreshVisibleRoute = useCallback(() => {
    if (!enabled) {
      return;
    }

    const now = Date.now();
    if (now - lastRefreshRef.current < debounceMs) {
      return;
    }

    lastRefreshRef.current = now;
    router.refresh();
  }, [debounceMs, enabled, router]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleFocus = () => refreshVisibleRoute();
    const handlePageShow = () => refreshVisibleRoute();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshVisibleRoute();
      }
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshVisibleRoute();
      }
    }, visibleIntervalMs);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, refreshVisibleRoute, visibleIntervalMs]);
}
