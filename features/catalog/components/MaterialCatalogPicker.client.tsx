'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, ChevronDown, ChevronUp, FolderOpen, ImageOff, Plus, Search, Sparkles } from 'lucide-react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Switch } from '@/shared/ui/switch';
import { cn } from '@/lib/utils';
import { catalogRepository } from '../repository';
import { CatalogMaterial } from '../types/dto';
import { buildMaterialCategoryTree, filterMaterialsByCategoryPath, MaterialCategorySelection } from '../lib/material-category-tree';

interface MaterialCatalogPickerProps {
    onAddMaterial: (material: CatalogMaterial) => Promise<void>;
    addedMaterialNames?: Set<string>;
    allowDuplicateSelection?: boolean;
}

interface SearchCriteria {
    query: string;
    isAiMode: boolean;
}

const defaultCategorySelection: MaterialCategorySelection = {
    lv1: null,
    lv2: null,
    lv3: null,
    lv4: null,
};

const sortRu = (a: string, b: string) => a.localeCompare(b, 'ru');
const CATEGORY_BROWSE_LIMIT = 5000;
const QUERY_SEARCH_LIMIT = 500;

export function MaterialCatalogPicker({ onAddMaterial, addedMaterialNames = new Set(), allowDuplicateSelection = false }: MaterialCatalogPickerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isAiMode, setIsAiMode] = useState(false);
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({ query: '', isAiMode: false });
    const [materials, setMaterials] = useState<CatalogMaterial[]>([]);
    const [allCategories, setAllCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
    const [selectedCategory, setSelectedCategory] = useState<MaterialCategorySelection>(defaultCategorySelection);
    const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
    const virtuosoRef = useRef<VirtuosoHandle>(null);

    useEffect(() => {
        let isCancelled = false;

        const fetchCategories = async () => {
            const loaded = await catalogRepository.getMaterialCategories();
            if (!isCancelled) {
                setAllCategories(loaded.sort(sortRu));
            }
        };

        void fetchCategories();

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        let isCancelled = false;

        const fetchData = async () => {
            setLoading(true);
            try {
                const hasQuery = searchCriteria.query.trim().length > 0;
                const limit = hasQuery ? QUERY_SEARCH_LIMIT : CATEGORY_BROWSE_LIMIT;
                const results = await catalogRepository.searchMaterials(
                    searchCriteria.query,
                    selectedCategory.lv1 ?? 'all',
                    searchCriteria.isAiMode,
                    limit,
                );

                if (isCancelled) {
                    return;
                }

                setMaterials(results);
                virtuosoRef.current?.scrollTo({ top: 0 });
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        void fetchData();

        return () => {
            isCancelled = true;
        };
    }, [searchCriteria, selectedCategory.lv1]);

    const submitSearch = () => {
        setSearchCriteria({
            query: searchQuery.trim(),
            isAiMode,
        });
    };

    const addMaterial = async (material: CatalogMaterial) => {
        setAddingIds((prev) => new Set(prev).add(material.id));

        try {
            await onAddMaterial(material);
        } finally {
            setAddingIds((prev) => {
                const next = new Set(prev);
                next.delete(material.id);
                return next;
            });
        }
    };

    const categoryTree = useMemo(() => buildMaterialCategoryTree(materials), [materials]);
    const categoryTreeMap = useMemo(() => new Map(categoryTree.map((node) => [node.name, node])), [categoryTree]);

    const categoryLv1Items = useMemo(
        () => Array.from(new Set([...allCategories, ...categoryTree.map((node) => node.name)])).sort(sortRu),
        [allCategories, categoryTree],
    );

    const filteredMaterials = useMemo(() => filterMaterialsByCategoryPath(materials, selectedCategory), [materials, selectedCategory]);
    const priceFormatter = useMemo(() => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }), []);
    const selectedCategoryLabel = useMemo(() => {
        const labels = [selectedCategory.lv1, selectedCategory.lv2, selectedCategory.lv3, selectedCategory.lv4].filter(Boolean);
        return labels.length > 0 ? labels.join(' / ') : 'Все категории';
    }, [selectedCategory]);

    const applyCategorySelection = (nextSelection: MaterialCategorySelection) => {
        setSelectedCategory(nextSelection);
        setIsCategoryPanelOpen(false);
    };


    return (
        <div className="flex flex-col flex-1 min-h-0 h-full bg-background overflow-hidden relative">
            <div className="p-3 sm:px-4 border-b bg-background shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={isAiMode ? 'Опишите, что нужно найти...' : 'Поиск по названию или коду...'}
                            className={cn(
                                'pl-9 h-9 text-sm bg-muted/30 focus-visible:ring-primary/20 transition-all border-none placeholder:text-sm',
                                isAiMode && 'ring-1 ring-primary/20 shadow-[0_0_15px_-3px_rgba(var(--primary),0.1)]',
                            )}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    submitSearch();
                                }
                            }}
                        />
                    </div>
                    <Button type="button" variant="outline" className="h-9 text-sm shadow-sm" onClick={submitSearch} disabled={loading}>
                        Поиск
                    </Button>
                    <div className="flex items-center gap-2 px-1">
                        <div className={cn(
                            'flex items-center justify-center h-8 w-8 rounded-full transition-all duration-300',
                            isAiMode ? 'bg-primary/10 text-primary animate-pulse' : 'bg-muted text-muted-foreground',
                        )}>
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <Switch
                            checked={isAiMode}
                            onCheckedChange={setIsAiMode}
                            className="data-[state=checked]:bg-primary"
                        />
                    </div>
                </div>
            </div>

            <div className="border-b px-3 py-2 lg:hidden">
                <Button
                    data-testid="material-categories-toggle"
                    type="button"
                    variant="outline"
                    className="h-8 w-full justify-between"
                    onClick={() => setIsCategoryPanelOpen((prev) => !prev)}
                >
                    <span className="truncate text-xs">Категории: {selectedCategoryLabel}</span>
                    {isCategoryPanelOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] overflow-hidden">
                <div data-testid="material-categories-panel" className={cn(
                    'border-b bg-muted/10 min-h-0 max-h-64 lg:max-h-none lg:border-b-0 lg:border-r',
                    isCategoryPanelOpen ? 'block' : 'hidden',
                    'lg:block',
                )}>
                    <div className="px-4 py-3 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">Категории L1–L4</div>
                    <ScrollArea className="h-full">
                        <div className="p-2 space-y-1">
                            <Button
                                variant={selectedCategory.lv1 === null ? 'secondary' : 'ghost'}
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => applyCategorySelection(defaultCategorySelection)}
                            >
                                Все категории
                            </Button>

                            {categoryLv1Items.map((lv1) => {
                                const lv1Node = categoryTreeMap.get(lv1);

                                return (
                                    <div key={lv1} className="space-y-1">
                                        <Button
                                            variant={selectedCategory.lv1 === lv1 && selectedCategory.lv2 === null ? 'secondary' : 'ghost'}
                                            size="sm"
                                            className="w-full justify-start"
                                            onClick={() => applyCategorySelection({ lv1, lv2: null, lv3: null, lv4: null })}
                                        >
                                            {lv1}
                                        </Button>

                                        {selectedCategory.lv1 === lv1 && lv1Node?.children.map((lv2) => (
                                            <div key={`${lv1}-${lv2.name}`} className="space-y-1 pl-3 border-l border-border/60 ml-2">
                                                <Button
                                                    variant={selectedCategory.lv2 === lv2.name && selectedCategory.lv3 === null ? 'secondary' : 'ghost'}
                                                    size="sm"
                                                    className="w-full justify-start"
                                                    onClick={() => applyCategorySelection({ lv1, lv2: lv2.name, lv3: null, lv4: null })}
                                                >
                                                    {lv2.name}
                                                </Button>

                                                {selectedCategory.lv2 === lv2.name && lv2.children.map((lv3) => (
                                                    <div key={`${lv1}-${lv2.name}-${lv3.name}`} className="space-y-1 pl-3 border-l border-border/60 ml-2">
                                                        <Button
                                                            variant={selectedCategory.lv3 === lv3.name && selectedCategory.lv4 === null ? 'secondary' : 'ghost'}
                                                            size="sm"
                                                            className="w-full justify-start"
                                                            onClick={() => applyCategorySelection({ lv1, lv2: lv2.name, lv3: lv3.name, lv4: null })}
                                                        >
                                                            {lv3.name}
                                                        </Button>

                                                        {selectedCategory.lv3 === lv3.name && lv3.children.map((lv4) => (
                                                            <div key={`${lv1}-${lv2.name}-${lv3.name}-${lv4.name}`} className="pl-3 border-l border-border/60 ml-2">
                                                                <Button
                                                                    variant={selectedCategory.lv4 === lv4.name ? 'secondary' : 'ghost'}
                                                                    size="sm"
                                                                    className="w-full justify-start"
                                                                    onClick={() => applyCategorySelection({ lv1, lv2: lv2.name, lv3: lv3.name, lv4: lv4.name })}
                                                                >
                                                                    {lv4.name}
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                <div className="relative min-h-0 overflow-hidden">
                    {loading && filteredMaterials.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2" />
                            <span className="text-sm">Загрузка материалов...</span>
                        </div>
                    ) : !loading && filteredMaterials.length === 0 ? (
                        <div className="m-4 flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                            <FolderOpen className="h-8 w-8 mb-2 opacity-20" />
                            <span className="text-sm">Материалы не найдены</span>
                        </div>
                    ) : (
                        <Virtuoso
                            ref={virtuosoRef}
                            data={filteredMaterials}
                            style={{ height: '100%', width: '100%' }}
                            className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                            increaseViewportBy={300}
                            itemContent={(_index, material) => {
                                const isAdding = addingIds.has(material.id);
                                const isAlreadyAdded = !allowDuplicateSelection && addedMaterialNames.has(material.name);

                                return (
                                    <div className="px-2 sm:px-4 py-1">
                                        <div className="group relative flex items-center justify-between gap-3 p-2 sm:p-3 rounded-xl hover:bg-muted/40 transition-colors border border-border/30 sm:border-transparent hover:shadow-sm hover:border-border/60 w-full overflow-hidden bg-background sm:bg-transparent">
                                            <div className="flex-1 min-w-0 flex items-center gap-3 sm:gap-4">
                                                <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted">
                                                    {material.imageUrl ? (
                                                        <Image
                                                            src={material.imageUrl}
                                                            alt={material.name}
                                                            fill
                                                            unoptimized
                                                            sizes="(max-width: 640px) 36px, 40px"
                                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <ImageOff className="h-4 w-4 text-muted-foreground/50" />
                                                    )}
                                                </div>
                                                <div className="space-y-1 min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                        <span className="text-[10px] font-mono text-muted-foreground font-medium uppercase tracking-tight bg-muted/60 px-1.5 py-0.5 rounded leading-none border border-border/40">
                                                            {material.code}
                                                        </span>
                                                        {material.categoryLv1 && (
                                                            <span className="text-[10px] text-muted-foreground font-medium bg-muted/30 px-1.5 py-0.5 rounded truncate max-w-[120px] leading-none border border-border/20">
                                                                {material.categoryLv1}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="text-[13px] sm:text-[14px] font-medium leading-snug text-foreground break-words line-clamp-2 md:line-clamp-none">
                                                        {material.name}
                                                    </h4>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[12px] font-medium text-foreground">
                                                            {priceFormatter.format(material.price)} ₽
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground leading-none">/ {material.unit}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center shrink-0 ml-2">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    disabled={isAdding || isAlreadyAdded}
                                                    className={cn(
                                                        'h-8 w-8 sm:h-9 sm:w-9 rounded-full border-border/50 transition-all shrink-0 active:scale-95 shadow-sm',
                                                        isAlreadyAdded
                                                            ? 'bg-primary/5 text-primary border-primary/20 opacity-100 cursor-default shadow-none'
                                                            : 'hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-md',
                                                    )}
                                                    onClick={() => void addMaterial(material)}
                                                >
                                                    {isAdding || isAlreadyAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4 sm:h-5 sm:w-5" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }}
                            components={{
                                Footer: () => (
                                    <div className="py-6 text-center text-xs text-muted-foreground opacity-50">
                                        Отображено {filteredMaterials.length} материалов
                                    </div>
                                ),
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
