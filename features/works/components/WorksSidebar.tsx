'use client';

import * as React from 'react';
import { Check, Layers, Tag } from "lucide-react";
import { getWorkPhases, getWorkCategories } from '@/app/actions/works/search';
import {
  CatalogFilterButton,
  CatalogFilterLoadingText,
  CatalogFilterSection,
  CatalogFilterSidebar,
} from '@/features/_shared/guide-catalog';

interface WorksSidebarProps {
  filters: { category?: string; phase?: string };
  setFilters: (filters: { category?: string; phase?: string } | ((prev: { category?: string; phase?: string }) => { category?: string; phase?: string })) => void;
  className?: string;
  isMobile?: boolean;
}

export function WorksSidebar({ filters, setFilters, className, isMobile }: WorksSidebarProps) {
  const [phases, setPhases] = React.useState<string[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadFilters() {
      setIsLoading(true);
      try {
        const [phasesRes, catsRes] = await Promise.all([
          getWorkPhases(),
          getWorkCategories()
        ]);
        
        if (phasesRes?.success && phasesRes.data) setPhases(phasesRes.data);
        if (catsRes?.success && catsRes.data) setCategories(catsRes.data);
      } finally {
        setIsLoading(false);
      }
    }
    loadFilters();
  }, []);

  const handlePhaseSelect = (phase: string | undefined) => {
    setFilters(prev => ({ ...prev, phase: phase === prev.phase ? undefined : phase }));
  };

  const handleCategorySelect = (category: string | undefined) => {
    setFilters(prev => ({ ...prev, category: category === prev.category ? undefined : category }));
  };

  const resetFilters = () => {
    setFilters({ category: undefined, phase: undefined });
  };

  const hasFilters = !!(filters.category || filters.phase);

  return (
    <CatalogFilterSidebar hasFilters={hasFilters} onReset={resetFilters} isMobile={isMobile} className={className}>
      <CatalogFilterSection icon={Layers} title="Этапы">
        <CatalogFilterButton onClick={() => handlePhaseSelect(undefined)}>
          Все этапы
        </CatalogFilterButton>
        {phases.map((p) => (
          <CatalogFilterButton
            key={p}
            onClick={() => handlePhaseSelect(p)}
            selected={filters.phase === p}
            checkIcon={<Check className="size-3" />}
          >
            {p}
          </CatalogFilterButton>
        ))}
        {isLoading && phases.length === 0 ? (
          <CatalogFilterLoadingText>Загрузка...</CatalogFilterLoadingText>
        ) : null}
      </CatalogFilterSection>

      <CatalogFilterSection icon={Tag} title="Категории" separated>
        <CatalogFilterButton onClick={() => handleCategorySelect(undefined)}>
          Все категории
        </CatalogFilterButton>
        {categories.map((c) => (
          <CatalogFilterButton
            key={c}
            onClick={() => handleCategorySelect(c)}
            selected={filters.category === c}
            checkIcon={<Check className="size-3" />}
          >
            {c}
          </CatalogFilterButton>
        ))}
        {isLoading && categories.length === 0 ? (
          <CatalogFilterLoadingText>Загрузка...</CatalogFilterLoadingText>
        ) : null}
      </CatalogFilterSection>
    </CatalogFilterSidebar>
  );
}
