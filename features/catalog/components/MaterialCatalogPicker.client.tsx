'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, FolderOpen, ImageOff, Plus, Search, Sparkles } from 'lucide-react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
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

export function MaterialCatalogPicker({ onAddMaterial, addedMaterialNames = new Set(), allowDuplicateSelection = false }: MaterialCatalogPickerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isAiMode, setIsAiMode] = useState(false);
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({ query: '', isAiMode: false });
    const [materials, setMaterials] = useState<CatalogMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
    const [selectedCategory, setSelectedCategory] = useState<MaterialCategorySelection>(defaultCategorySelection);
    const virtuosoRef = useRef<VirtuosoHandle>(null);

    useEffect(() => {
        let isCancelled = false;

        const fetchData = async () => {
            setLoading(true);
            try {
                const results = await catalogRepository.searchMaterials(searchCriteria.query, 'all', searchCriteria.isAiMode);
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
    }, [searchCriteria]);

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

    const filteredMaterials = useMemo(() => filterMaterialsByCategoryPath(materials, selectedCategory), [materials, selectedCategory]);

    const priceFormatter = useMemo(() => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }), []);

    return (
        <div className="flex flex-col flex-1 min-h-0 h-full bg-background overflow-hidden">
            <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={isAiMode ? 'Опишите, что нужно найти...' : 'Поиск по названию или коду...'}
                            className={cn(
                                'pl-9 h-10 bg-muted/30 focus-visible:ring-primary/20 transition-all border-none',
                                isAiMode && 'ring-1 ring-primary/20 shadow-[0_0_15px_-3px_rgba(var(--primary),0.1)]'
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
                    <Button type="button" variant="outline" className="h-10" onClick={submitSearch} disabled={loading}>
                        Поиск
                    </Button>
                    <div className="flex items-center gap-2 px-1">
                        <div className={cn(
                            'flex items-center justify-center h-8 w-8 rounded-full transition-all duration-300',
                            isAiMode ? 'bg-primary/10 text-primary animate-pulse' : 'bg-muted text-muted-foreground'
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

            <div className="flex-1 min-h-0 grid grid-cols-[280px_1fr] overflow-hidden">
                <div className="border-r bg-muted/20 min-h-0">
                    <div className="px-3 py-2 border-b text-xs font-medium text-muted-foreground">Категории материалов L1–L4</div>
                    <ScrollArea className="h-full">
                        <div className="p-2 space-y-1">
                            <Button
                                variant={selectedCategory.lv1 === null ? 'secondary' : 'ghost'}
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => setSelectedCategory(defaultCategorySelection)}
                            >
                                Все категории
                            </Button>

                            {categoryTree.map((lv1) => (
                                <div key={lv1.name} className="space-y-1">
                                    <Button
                                        variant={selectedCategory.lv1 === lv1.name && selectedCategory.lv2 === null ? 'secondary' : 'ghost'}
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() => setSelectedCategory({ lv1: lv1.name, lv2: null, lv3: null, lv4: null })}
                                    >
                                        {lv1.name}
                                    </Button>

                                    {selectedCategory.lv1 === lv1.name && lv1.children.map((lv2) => (
                                        <div key={`${lv1.name}-${lv2.name}`} className="space-y-1 pl-3 border-l border-border/60 ml-2">
                                            <Button
                                                variant={selectedCategory.lv2 === lv2.name && selectedCategory.lv3 === null ? 'secondary' : 'ghost'}
                                                size="sm"
                                                className="w-full justify-start"
                                                onClick={() => setSelectedCategory({ lv1: lv1.name, lv2: lv2.name, lv3: null, lv4: null })}
                                            >
                                                {lv2.name}
                                            </Button>

                                            {selectedCategory.lv2 === lv2.name && lv2.children.map((lv3) => (
                                                <div key={`${lv1.name}-${lv2.name}-${lv3.name}`} className="space-y-1 pl-3 border-l border-border/60 ml-2">
                                                    <Button
                                                        variant={selectedCategory.lv3 === lv3.name && selectedCategory.lv4 === null ? 'secondary' : 'ghost'}
                                                        size="sm"
                                                        className="w-full justify-start"
                                                        onClick={() => setSelectedCategory({ lv1: lv1.name, lv2: lv2.name, lv3: lv3.name, lv4: null })}
                                                    >
                                                        {lv3.name}
                                                    </Button>

                                                    {selectedCategory.lv3 === lv3.name && lv3.children.map((lv4) => (
                                                        <div key={`${lv1.name}-${lv2.name}-${lv3.name}-${lv4.name}`} className="pl-3 border-l border-border/60 ml-2">
                                                            <Button
                                                                variant={selectedCategory.lv4 === lv4.name ? 'secondary' : 'ghost'}
                                                                size="sm"
                                                                className="w-full justify-start"
                                                                onClick={() => setSelectedCategory({ lv1: lv1.name, lv2: lv2.name, lv3: lv3.name, lv4: lv4.name })}
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
                            ))}
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
                                    <div className="px-2 py-0.5">
                                        <div className="group relative flex items-center justify-between gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-all border border-border/40 sm:border-transparent hover:border-border/60 w-full overflow-hidden">
                                            <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
                                                <div className="relative hidden xs:flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted">
                                                    {material.imageUrl ? (
                                                        <Image
                                                            src={material.imageUrl}
                                                            alt={material.name}
                                                            fill
                                                            unoptimized
                                                            sizes="40px"
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <ImageOff className="h-4 w-4 text-muted-foreground/70" />
                                                    )}
                                                </div>
                                                <div className="space-y-0.5 min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-[9px] font-mono text-muted-foreground font-medium uppercase tracking-tight bg-muted/80 px-1 py-0.5 rounded leading-none">
                                                            {material.code}
                                                        </span>
                                                        {material.categoryLv1 && (
                                                            <span className="text-[9px] text-muted-foreground font-medium bg-muted/50 px-1 py-0.5 rounded truncate max-w-[80px] sm:max-w-[120px] leading-none">
                                                                {material.categoryLv1}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="text-[13px] font-medium leading-snug text-foreground break-words line-clamp-2 md:line-clamp-none">
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
                                            <div className="flex items-center shrink-0 ml-1">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    disabled={isAdding || isAlreadyAdded}
                                                    className={cn(
                                                        'h-7 w-7 rounded-full border-border/50 transition-all shrink-0 active:scale-90',
                                                        isAlreadyAdded
                                                            ? 'bg-primary/10 text-primary border-primary/20 opacity-100 cursor-default'
                                                            : 'hover:bg-primary hover:text-primary-foreground hover:border-primary'
                                                    )}
                                                    onClick={() => void addMaterial(material)}
                                                >
                                                    {isAdding || isAlreadyAdded ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
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
                                )
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
