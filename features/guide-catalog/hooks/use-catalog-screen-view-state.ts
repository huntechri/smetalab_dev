import { useEffect, useState } from "react";

import {
  useBreadcrumbs,
  type BreadcrumbEntry,
} from "@/components/providers/breadcrumb-provider";

interface UseCatalogScreenViewStateOptions {
  breadcrumbs: BreadcrumbEntry[];
}

export function useCatalogScreenViewState({
  breadcrumbs,
}: UseCatalogScreenViewStateOptions) {
  const [mounted, setMounted] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useBreadcrumbs(breadcrumbs);

  return {
    mounted,
    showSidebar,
    setShowSidebar,
  };
}
