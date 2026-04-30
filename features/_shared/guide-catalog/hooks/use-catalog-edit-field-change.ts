import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";

export function useCatalogEditFieldChange<TData extends object>(
  setEditFormData: Dispatch<SetStateAction<TData | null>>,
) {
  return useCallback(
    (field: string, val: unknown) => {
      setEditFormData((prev) => {
        if (!prev) return prev;
        return { ...prev, [field]: val };
      });
    },
    [setEditFormData],
  );
}
