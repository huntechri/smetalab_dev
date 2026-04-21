import { useCallback, useState } from "react";

export function useDirectorySheetState<TItem>() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TItem | null>(null);

  const openCreateSheet = useCallback(() => {
    setEditingItem(null);
    setIsSheetOpen(true);
  }, []);

  const openEditSheet = useCallback((item: TItem) => {
    setEditingItem(item);
    setIsSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setIsSheetOpen(false);
    setEditingItem(null);
  }, []);

  return {
    isSheetOpen,
    setIsSheetOpen,
    editingItem,
    setEditingItem,
    openCreateSheet,
    openEditSheet,
    closeSheet,
  };
}
