import { useState } from "react";

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
  const [showSidebar, setShowSidebar] = useState(false);

  useBreadcrumbs(breadcrumbs);

  return {
    mounted: true,
    showSidebar,
    setShowSidebar,
  };
}
