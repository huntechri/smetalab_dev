'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, FolderOpen, ImageOff, Plus } from 'lucide-react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { catalogRepository } from '../repository';
import { CatalogMaterial } from '../types/dto';
import { WorkCatalogFilters } from './WorkCatalogFilters.client';

interface MaterialCatalogPickerProps {
    onAddMaterial: (material: CatalogMaterial) => Promise<void>;
    addedMaterialNames?: Set<string>;
}

interface SearchCriteria {
    query: string;
    category: string;
    isAiMode: boolean;
}

export function MaterialCatalogPicker({ onAddMaterial, addedMaterialNames = new Set() }: MaterialCatalogPickerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isAiMode, setIsAiMode] = useState(false);
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({ query: '', category: 'all', isAiMode: false });
    const [materials, setMaterials] = useState<CatalogMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
    const virtuosoRef = useRef<VirtuosoHandle>(null);

    useEffect(() => {
        let isCancelled = false;

        const fetchData = async () => {
            setLoading(true);
            try {
                const results = await catalogRepository.searchMaterials(searchCriteria.query, searchCriteria.category, searchCriteria.isAiMode);
                if (isCancelled) return;
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
            category: selectedCategory,
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

    return (
        <div className="flex flex-col flex-1 min-h-0 h-full bg-background overflow-hidden">
            <WorkCatalogFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                isAiMode={isAiMode}
                onAiModeChange={setIsAiMode}
                onSearchSubmit={submitSearch}
                isSearching={loading}
                loadCategories={() => catalogRepository.getMaterialCategories()}
                allCategoriesLabel="Все категории"
            />

            <div className="flex-1 relative min-h-0 overflow-hidden">
                {loading && materials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2" />
                        <span className="text-sm">Загрузка материалов...</span>
                    </div>
                ) : !loading && materials.length === 0 ? (
                    <div className="m-4 flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                        <FolderOpen className="h-8 w-8 mb-2 opacity-20" />
                        <span className="text-sm">Материалы не найдены</span>
                    </div>
                ) : (
                    <Virtuoso
                        ref={virtuosoRef}
                        data={materials}
                        style={{ height: '100%', width: '100%' }}
                        className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                        increaseViewportBy={300}
                        itemContent={(_index, material) => {
                            const isAdding = addingIds.has(material.id);
                            const isAlreadyAdded = addedMaterialNames.has(material.name);

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
                                                        {new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(material.price)} ₽
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
                                                    "h-7 w-7 rounded-full border-border/50 transition-all shrink-0 active:scale-90",
                                                    isAlreadyAdded
                                                        ? "bg-primary/10 text-primary border-primary/20 opacity-100 cursor-default"
                                                        : "hover:bg-primary hover:text-primary-foreground hover:border-primary"
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
                                    Отображено {materials.length} материалов
                                </div>
                            )
                        }}
                    />
                )}
            </div>
        </div>
    );
}
