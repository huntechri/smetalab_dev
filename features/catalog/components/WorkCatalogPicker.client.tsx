'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Check } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { CatalogIndexToken, CatalogToken } from '@/shared/ui/catalog-token';
import { LoadingState, NoResultsState } from '@/shared/ui/states';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { formatPrice } from '@/lib/shared/formatters';
import { catalogRepository } from '../repository';
import { CatalogWork } from '../types/dto';
import { WorkCatalogFilters } from './WorkCatalogFilters.client';

interface Props {
    onAddWork: (work: CatalogWork) => void;
    addedWorkNames?: Set<string>;
}

interface SearchCriteria {
    query: string;
    category: string;
    isAiMode: boolean;
}

const INITIAL_WORKS_LIMIT = 120;
const QUERY_WORKS_LIMIT = 300;

export function WorkCatalogPicker({ onAddWork, addedWorkNames = new Set() }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isAiMode, setIsAiMode] = useState(false);
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({ query: '', category: 'all', isAiMode: false });
    const [works, setWorks] = useState<CatalogWork[]>([]);
    const [loading, setLoading] = useState(true);
    const virtuosoRef = useRef<VirtuosoHandle>(null);

    useEffect(() => {
        let isCancelled = false;

        const fetchData = async () => {
            setLoading(true);
            try {
                const hasQuery = searchCriteria.query.trim().length > 0;
                const limit = hasQuery || searchCriteria.isAiMode ? QUERY_WORKS_LIMIT : INITIAL_WORKS_LIMIT;
                const results = await catalogRepository.searchWorks(
                    searchCriteria.query,
                    searchCriteria.category,
                    searchCriteria.isAiMode,
                    limit,
                );

                if (isCancelled) return;

                setWorks(results);
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

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setSearchCriteria((current) => ({
            ...current,
            category,
        }));
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 h-full bg-background overflow-hidden">
            <WorkCatalogFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                isAiMode={isAiMode}
                onAiModeChange={setIsAiMode}
                onSearchSubmit={submitSearch}
                isSearching={loading}
            />

            <div className="flex-1 relative min-h-0 overflow-hidden">
                {loading && works.length === 0 ? (
                    <LoadingState
                        title="Загрузка позиций..."
                        description={null}
                        density="compact"
                    />
                ) : !loading && works.length === 0 ? (
                    <NoResultsState title="В этом разделе ничего не найдено" />
                ) : (
                    <Virtuoso
                        ref={virtuosoRef}
                        data={works}
                        className="h-full w-full"
                        className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                        increaseViewportBy={300}
                        itemContent={(index, work) => (
                            <div className="px-2 py-0.5">
                                <div
                                    className="group relative flex items-center justify-between gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-all cursor-default border border-border/40 sm:border-transparent hover:border-border/60 w-full overflow-hidden"
                                >
                                    <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
                                        <CatalogIndexToken className="hidden xs:flex">
                                            {work.code.split('.').pop()}
                                        </CatalogIndexToken>
                                        <div className="space-y-0.5 min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <CatalogToken tone="code" density="compact">
                                                    {work.code}
                                                </CatalogToken>
                                                {work.category && (
                                                    <CatalogToken tone="category" density="compact" className="max-w-20 sm:max-w-28">
                                                        {work.category}
                                                    </CatalogToken>
                                                )}
                                            </div>
                                            <h4 className="text-sm font-medium leading-snug text-foreground break-words line-clamp-2 md:line-clamp-none">
                                                {work.name}
                                            </h4>

                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-xs font-medium text-foreground">
                                                    {formatPrice(work.price)} ₽
                                                </span>
                                                <span className="text-[10px] text-muted-foreground leading-none">/ {work.unit}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center shrink-0 ml-1">
                                        <Button
                                            size="icon-xs"
                                            variant="outline"
                                            disabled={addedWorkNames.has(work.name)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAddWork(work);
                                            }}
                                        >
                                            {addedWorkNames.has(work.name) ? (
                                                <Check className="h-3.5 w-3.5" />
                                            ) : (
                                                <Plus className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                        components={{
                            Footer: () => (
                                <div className="py-6 text-center text-xs text-muted-foreground opacity-50">
                                    Отображено {works.length} позиций {selectedCategory !== 'all' ? `в разделе "${selectedCategory}"` : ''}
                                </div>
                            )
                        }}
                    />
                )}
            </div>
        </div>
    );
}
