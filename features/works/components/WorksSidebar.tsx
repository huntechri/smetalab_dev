'use client';

import * as React from 'react';
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Check, FilterX, Layers, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { getWorkPhases, getWorkCategories } from '@/app/actions/works/search';

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

  const containerStyles = isMobile 
    ? "w-full flex-1 flex flex-col bg-transparent overflow-hidden h-full"
    : "w-64 bg-card border border-border rounded-xl shadow-sm flex flex-col h-[771px] overflow-hidden";

  const scrollHeight = isMobile ? "calc(100vh - 120px)" : "calc(771px - 60px)";

  return (
    <div className={cn(containerStyles, className)}>
      <div className={cn(
        "p-4 flex items-center justify-between border-b border-border/50 bg-secondary/10 shrink-0",
        isMobile && "bg-transparent border-none px-0"
      )}>
        <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2 uppercase tracking-wider">
          Фильтры
        </h3>
        {hasFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive"
          >
            <FilterX className="size-3 mr-1" />
            Сбросить
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 overflow-hidden" style={{ height: scrollHeight }}>
        <div className={cn("p-4 space-y-6 pb-6", isMobile && "px-0 pb-12")}>
          {/* Phase Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2 text-[12px] font-medium text-muted-foreground">
              <Layers className="size-3.5" />
              Этапы
            </div>
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePhaseSelect(undefined)}
                className={cn(
                  "h-8 justify-start px-2 font-normal text-[13px] rounded-md",
                  !filters.phase ? "bg-secondary text-secondary-foreground font-medium" : "text-muted-foreground hover:bg-secondary/50"
                )}
              >
                Все этапы
              </Button>
              {phases.map((p) => (
                <Button
                  key={p}
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePhaseSelect(p)}
                  className={cn(
                    "h-8 justify-between px-2 font-normal text-[13px] rounded-md",
                    filters.phase === p ? "bg-secondary text-secondary-foreground font-medium" : "text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <span className="truncate">{p}</span>
                  {filters.phase === p && <Check className="size-3 shrink-0 ml-2" />}
                </Button>
              ))}
              {isLoading && phases.length === 0 && (
                 <div className="px-2 py-1 text-[12px] text-muted-foreground italic">Загрузка...</div>
              )}
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Category Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2 text-[12px] font-medium text-muted-foreground">
              <Tag className="size-3.5" />
              Категории
            </div>
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCategorySelect(undefined)}
                className={cn(
                  "h-8 justify-start px-2 font-normal text-[13px] rounded-md",
                  !filters.category ? "bg-secondary text-secondary-foreground font-medium" : "text-muted-foreground hover:bg-secondary/50"
                )}
              >
                Все категории
              </Button>
              {categories.map((c) => (
                <Button
                  key={c}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCategorySelect(c)}
                  className={cn(
                    "h-8 justify-between px-2 font-normal text-[13px] rounded-md",
                    filters.category === c ? "bg-secondary text-secondary-foreground font-medium" : "text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <span className="truncate">{c}</span>
                  {filters.category === c && <Check className="size-3 shrink-0 ml-2" />}
                </Button>
              ))}
              {isLoading && categories.length === 0 && (
                 <div className="px-2 py-1 text-[12px] text-muted-foreground italic">Загрузка...</div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
