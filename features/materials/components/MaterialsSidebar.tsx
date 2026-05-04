'use client';

import * as React from 'react';
import { Check, Tag, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from '@/shared/ui/button';
import { getMaterialCategoryTree } from '@/app/actions/materials/search';
import { MaterialCategoryNode } from '@/lib/domain/materials/materials.contract';
import {
  CatalogFilterButton,
  CatalogFilterEmptyText,
  CatalogFilterLoadingState,
  CatalogFilterNestedGroup,
  CatalogFilterSection,
  CatalogFilterSidebar,
} from '@/features/_shared/guide-catalog';

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

  const renderCategoryNode = (node: MaterialCategoryNode, level: 1 | 2 | 3 | 4, parentPath: string = "") => {
    const currentPath = parentPath ? `${parentPath}>${node.name}` : node.name;
    const isExpanded = expandedNodes.has(currentPath);
    const isSelected = filters[`categoryLv${level}` as keyof typeof filters] === node.name;
    const hasChildren = node.children.length > 0;

    return (
      <div key={currentPath}>
        <div className="flex items-center gap-1">
          <CatalogFilterButton
            onClick={() => handleCategorySelect(level, node.name, currentPath)}
            title={node.name}
            selected={isSelected}
            checkIcon={<Check />}
          >
            {node.name}
          </CatalogFilterButton>
          
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(event) => {
                event.stopPropagation();
                toggleExpand(currentPath);
              }}
            >
              {isExpanded ? <ChevronDown /> : <ChevronRight className="size-3.5" />}
            </Button>
          )}
        </div>

        {hasChildren && isExpanded ? (
          <CatalogFilterNestedGroup>
            {node.children.map((child) => renderCategoryNode(child, (level + 1) as 1 | 2 | 3 | 4, currentPath))}
          </CatalogFilterNestedGroup>
        ) : null}
      </div>
    );
  };

  return (
    <CatalogFilterSidebar hasFilters={hasFilters} onReset={resetFilters} isMobile={isMobile} className={className}>
      <CatalogFilterSection icon={Tag} title="Каскадный каталог">
        <CatalogFilterButton onClick={() => handleCategorySelect(1, undefined)}>
          Все материалы
        </CatalogFilterButton>
        
        {categoryTree.map((node) => renderCategoryNode(node, 1))}
        
        {isLoading && categoryTree.length === 0 ? (
          <CatalogFilterLoadingState>Загрузка структуры...</CatalogFilterLoadingState>
        ) : null}
        
        {!isLoading && categoryTree.length === 0 ? (
          <CatalogFilterEmptyText>Категории не найдены</CatalogFilterEmptyText>
        ) : null}
      </CatalogFilterSection>
    </CatalogFilterSidebar>
  );
}

