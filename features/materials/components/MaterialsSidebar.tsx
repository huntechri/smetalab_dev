'use client';

import * as React from 'react';
import { ScrollArea } from "@repo/ui";
import { Button } from '@repo/ui';
import { Check, FilterX, Tag, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMaterialCategoryTree } from '@/app/actions/materials/search';
import { MaterialCategoryNode } from '@/lib/domain/materials/materials.contract';

interface MaterialsSidebarProps {
  filters: { 
    categoryLv1?: string;
    categoryLv2?: string;
    categoryLv3?: string;
    categoryLv4?: string;
  };
  setFilters: (
    filters:
      | MaterialsSidebarProps['filters']
      | ((prev: MaterialsSidebarProps['filters']) => MaterialsSidebarProps['filters'])
  ) => void;
  className?: string;
  isMobile?: boolean;
}

export function MaterialsSidebar({ filters, setFilters, className, isMobile }: MaterialsSidebarProps) {
  const [categoryTree, setCategoryTree] = React.useState<MaterialCategoryNode[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    async function loadTree() {
      setIsLoading(true);
      try {
        const res = await getMaterialCategoryTree();
        if (res?.success && res.data) {
          setCategoryTree(res.data);
          // Auto-expand if a category is selected
          if (filters.categoryLv1) {
            setExpandedNodes(prev => new Set([...prev, filters.categoryLv1!]));
            if (filters.categoryLv2) {
              setExpandedNodes(prev => new Set([...prev, `${filters.categoryLv1}>${filters.categoryLv2}`]));
              if (filters.categoryLv3) {
                setExpandedNodes(prev => new Set([...prev, `${filters.categoryLv1}>${filters.categoryLv2}>${filters.categoryLv3}`]));
              }
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadTree();
  }, []);

  const toggleExpand = (path: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleCategorySelect = (level: 1 | 2 | 3 | 4, name: string | undefined, path?: string) => {
    if (name === undefined) {
      setFilters({ 
        categoryLv1: undefined, 
        categoryLv2: undefined, 
        categoryLv3: undefined, 
        categoryLv4: undefined 
      });
      return;
    }

    const nextFilters = { ...filters };
    
    if (level === 1) {
      nextFilters.categoryLv1 = nextFilters.categoryLv1 === name ? undefined : name;
      nextFilters.categoryLv2 = undefined;
      nextFilters.categoryLv3 = undefined;
      nextFilters.categoryLv4 = undefined;
      if (path && nextFilters.categoryLv1) setExpandedNodes(prev => new Set([...prev, path]));
    } else if (level === 2) {
      nextFilters.categoryLv2 = nextFilters.categoryLv2 === name ? undefined : name;
      nextFilters.categoryLv3 = undefined;
      nextFilters.categoryLv4 = undefined;
      if (path && nextFilters.categoryLv2) setExpandedNodes(prev => new Set([...prev, path]));
    } else if (level === 3) {
      nextFilters.categoryLv3 = nextFilters.categoryLv3 === name ? undefined : name;
      nextFilters.categoryLv4 = undefined;
      if (path && nextFilters.categoryLv3) setExpandedNodes(prev => new Set([...prev, path]));
    } else if (level === 4) {
      nextFilters.categoryLv4 = nextFilters.categoryLv4 === name ? undefined : name;
    }

    setFilters(nextFilters);
  };

  const resetFilters = () => {
    setFilters({ 
      categoryLv1: undefined, 
      categoryLv2: undefined, 
      categoryLv3: undefined, 
      categoryLv4: undefined 
    });
  };

  const hasFilters = !!(filters.categoryLv1 || filters.categoryLv2 || filters.categoryLv3 || filters.categoryLv4);

  const containerStyles = isMobile 
    ? "w-full flex-1 flex flex-col bg-transparent overflow-hidden h-full"
    : "w-64 bg-card border border-border rounded-xl shadow-sm flex flex-col h-[771px] overflow-hidden";

  const scrollHeight = isMobile ? "calc(100vh - 120px)" : "calc(771px - 60px)";

  const renderCategoryNode = (node: MaterialCategoryNode, level: 1 | 2 | 3 | 4, parentPath: string = "") => {
    const currentPath = parentPath ? `${parentPath}>${node.name}` : node.name;
    const isExpanded = expandedNodes.has(currentPath);
    const isSelected = filters[`categoryLv${level}` as keyof typeof filters] === node.name;
    const hasChildren = node.children.length > 0;

    return (
      <div key={currentPath} className="flex flex-col gap-1">
        <div className="flex items-center gap-1 group">
          <Button
            variant="ghost"
            onClick={() => handleCategorySelect(level, node.name, currentPath)}
            title={node.name}
          >
            <span className="block whitespace-normal break-words">{node.name}</span>
            {isSelected && <Check className="size-3 shrink-0 ml-auto self-center" />}
          </Button>
          
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(currentPath);
              }}
            >
              {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            </Button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="flex flex-col gap-1 pl-4 ml-2 border-l border-border/60">
            {node.children.map((child) => renderCategoryNode(child, (level + 1) as 1 | 2 | 3 | 4, currentPath))}
          </div>
        )}
      </div>
    );
  };

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
            size="icon-sm" 
            onClick={resetFilters}
          >
            <FilterX className="size-3 mr-1" />
            Сбросить
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 overflow-hidden" style={{ height: scrollHeight }}>
        <div className={cn("p-4 space-y-6 pb-6", isMobile && "px-0 pb-12")}>
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2 text-[12px] font-medium text-muted-foreground">
              <Tag className="size-3.5" />
              Каскадный каталог
            </div>
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                onClick={() => handleCategorySelect(1, undefined)}
              >
                <span className="block whitespace-normal break-words">Все материалы</span>
              </Button>
              
              {categoryTree.map((node) => renderCategoryNode(node, 1))}
              
              {isLoading && categoryTree.length === 0 && (
                 <div className="px-2 py-4 flex flex-col items-center gap-2">
                    <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="text-[11px] text-muted-foreground animate-pulse">Загрузка структуры...</span>
                 </div>
              )}
              
              {!isLoading && categoryTree.length === 0 && (
                <div className="px-2 py-4 text-[12px] text-muted-foreground text-center italic opacity-60">
                   Категории не найдены
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

