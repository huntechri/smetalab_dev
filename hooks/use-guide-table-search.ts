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

interface UseGuideTableSearchOptions<TData, TCursor extends Record<string, unknown>> {
    initialData: TData[];
    data: TData[];
    setData: React.Dispatch<React.SetStateAction<TData[]>>;
    pageSize?: number;
    aiSearch: (query: string) => Promise<SearchResult<TData>>;
    searchPage: (args: { query: string }) => Promise<LoadMoreResult<TData>>;
    loadMorePage: (args: { query: string } & TCursor) => Promise<LoadMoreResult<TData>>;
    getCursorFromLast: (lastItem: TData | undefined) => TCursor;
}

export function useGuideTableSearch<TData, TCursor extends Record<string, unknown>>({
    initialData,
    data,
    setData,
    pageSize = 50,
    aiSearch,
    searchPage,
    loadMorePage,
    getCursorFromLast,
}: UseGuideTableSearchOptions<TData, TCursor>) {
    const { toast } = useAppToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAiMode, setIsAiMode] = useState(false);
    const [isAiSearching, startAiSearchTransition] = useTransition();
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const handleSearch = async (query: string) => {
        const targetQuery = query ?? searchTerm;

        if (targetQuery.length === 0) {
            setData(initialData);
            setHasMore(initialData.length >= pageSize);
            return;
        }

        if (isAiMode) {
            startAiSearchTransition(async () => {
                const result = await aiSearch(targetQuery);
                if (result.success) {
                    setData(result.data ?? []);
                    setHasMore(false);
                } else {
                    toast({ variant: "destructive", title: "Ошибка поиска", description: result.message });
                }
            });
            return;
        }

        setIsLoadingMore(true);
        const res = await searchPage({ query: targetQuery });
        if (res.success) {
            const nextData = res.data ?? [];
            setData(nextData);
            setHasMore(nextData.length === pageSize);
        }
        setIsLoadingMore(false);
    };

    useEffect(() => {
        if (!searchTerm) {
            setData(initialData);
            setHasMore(initialData.length >= pageSize);
        }
    }, [initialData, pageSize, searchTerm, setData]);

    const loadMore = async () => {
        if (isLoadingMore || !hasMore || isAiMode) return;

        setIsLoadingMore(true);
        const lastItem = data[data.length - 1];
        const cursor = getCursorFromLast(lastItem);
        const res = await loadMorePage({
            query: searchTerm,
            ...cursor,
        });

        const nextData = res.data ?? [];

        if (res.success && nextData.length > 0) {
            setData(prev => [...prev, ...nextData]);
            setHasMore(nextData.length === pageSize);
        } else {
            setHasMore(false);
        }
        setIsLoadingMore(false);
    };

    return {
        searchTerm,
        setSearchTerm,
        isAiMode,
        setIsAiMode,
        isAiSearching,
        isLoadingMore,
        handleSearch,
        loadMore
    };
}
