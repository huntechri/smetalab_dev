import { useState, useEffect, useTransition } from 'react';
import { useAppToast } from "@/components/providers/use-app-toast";

interface SearchResult<TData> {
    success: boolean;
    data?: TData[];
    message?: string;
}

interface LoadMoreResult<TData> {
    success: boolean;
    data?: TData[];
    message?: string;
}

interface UseGuideTableSearchOptions<TData, TCursor extends Record<string, unknown>, TFilters extends Record<string, unknown> = {}> {
    initialData: TData[];
    data: TData[];
    setData: React.Dispatch<React.SetStateAction<TData[]>>;
    pageSize?: number;
    aiSearch: (query: string, filters: TFilters) => Promise<SearchResult<TData>>;
    searchPage: (args: { query: string } & TFilters) => Promise<LoadMoreResult<TData>>;
    loadMorePage: (args: { query: string } & TCursor & TFilters) => Promise<LoadMoreResult<TData>>;
    getCursorFromLast: (lastItem: TData | undefined, filters: TFilters) => TCursor;
    initialFilters?: TFilters;
}

export function useGuideTableSearch<TData, TCursor extends Record<string, unknown>, TFilters extends Record<string, unknown> = {}>({
    initialData,
    data,
    setData,
    pageSize = 50,
    aiSearch,
    searchPage,
    loadMorePage,
    getCursorFromLast,
    initialFilters = {} as TFilters,
}: UseGuideTableSearchOptions<TData, TCursor, TFilters>) {
    const { toast } = useAppToast();
    const [filters, setFilters] = useState<TFilters>(initialFilters);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAiMode, setIsAiMode] = useState(false);
    const [isAiSearching, startAiSearchTransition] = useTransition();
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const handleSearch = async (query?: string, nextFilters?: TFilters) => {
        const targetQuery = query ?? searchTerm;
        const targetFilters = nextFilters ?? filters;

        if (targetQuery.length === 0 && Object.values(targetFilters).every(v => !v || v === 'all')) {
            setData(initialData);
            setHasMore(initialData.length >= pageSize);
            return;
        }

        if (isAiMode) {
            startAiSearchTransition(async () => {
                const result = await aiSearch(targetQuery, targetFilters);
                if (result.success) {
                    setData(result.data ?? []);
                    setHasMore(false);
                } else {
                    toast({ variant: "destructive", title: "Ошибка поиска", description: result.message });
                }
            });
            return;
        }

        setIsSearching(true);
        try {
            const res = await searchPage({ query: targetQuery, ...targetFilters });
            if (res.success) {
                const nextData = res.data ?? [];
                setData(nextData);
                setHasMore(nextData.length === pageSize);
            }
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        if (!searchTerm && Object.values(filters).every(v => !v || v === 'all')) {
            setData(initialData);
            setHasMore(initialData.length >= pageSize);
        }
    }, [initialData, pageSize, searchTerm, setData, filters]);

    const loadMore = async () => {
        if (isLoadingMore || !hasMore || isAiMode) return;

        setIsLoadingMore(true);
        try {
            const lastItem = data[data.length - 1];
            const cursor = getCursorFromLast(lastItem, filters);
            const res = await loadMorePage({
                query: searchTerm,
                ...cursor,
                ...filters,
            });

            const nextData = res.data ?? [];

            if (res.success && nextData.length > 0) {
                setData(prev => [...prev, ...nextData]);
                setHasMore(nextData.length === pageSize);
            } else {
                setHasMore(false);
            }
        } finally {
            setIsLoadingMore(false);
        }
    };

    return {
        searchTerm,
        setSearchTerm,
        filters,
        setFilters: (newFilters: TFilters | ((prev: TFilters) => TFilters)) => {
            if (typeof newFilters === 'function') {
                const next = newFilters(filters);
                setFilters(next);
                handleSearch(searchTerm, next);
            } else {
                setFilters(newFilters);
                handleSearch(searchTerm, newFilters);
            }
        },
        isAiMode,
        setIsAiMode,
        isAiSearching,
        isSearching,
        isLoadingMore,
        handleSearch,
        loadMore
    };
}
