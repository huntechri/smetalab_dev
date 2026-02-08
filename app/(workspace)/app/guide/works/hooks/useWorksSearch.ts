import { useState, useEffect } from 'react';
import { searchWorks } from '@/app/actions/works';
import { fetchMoreWorks } from '@/app/actions/works/search';
import { WorkRow } from '@/types/work-row';
import { useToast } from "@/components/ui/use-toast";
import { useTransition } from 'react';

export function useWorksSearch(
    initialData: WorkRow[],
    data: WorkRow[],
    setData: React.Dispatch<React.SetStateAction<WorkRow[]>>
) {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAiMode, setIsAiMode] = useState(false);
    const [isAiSearching, startAiSearchTransition] = useTransition();
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Unified search trigger (Manual)
    const handleSearch = async (query: string) => {
        const targetQuery = query ?? searchTerm;

        if (targetQuery.length === 0) {
            setData(initialData);
            setHasMore(initialData.length >= 50);
            return;
        }

        if (isAiMode) {
            startAiSearchTransition(async () => {
                const result = await searchWorks(targetQuery);
                if (result.success) {
                    setData(result.data as WorkRow[]);
                    setHasMore(false);
                } else {
                    toast({ variant: "destructive", title: "Ошибка поиска", description: result.message });
                }
            });
        } else {
            setIsLoadingMore(true);
            const res = await fetchMoreWorks({ query: targetQuery });
            if (res.success) {
                setData(res.data);
                setHasMore(res.data.length === 50);
            }
            setIsLoadingMore(false);
        }
    };

    // Keep initial data sync if needed (only on mount/reset)
    useEffect(() => {
        if (!searchTerm) {
            setData(initialData);
            setHasMore(initialData.length >= 50);
        }
    }, [initialData, searchTerm, setData]);

    const loadMore = async () => {
        if (isLoadingMore || !hasMore || isAiMode) return;

        setIsLoadingMore(true);
        const lastItem = data[data.length - 1];
        const res = await fetchMoreWorks({
            query: searchTerm,
            lastSortOrder: lastItem?.sortOrder,
            limit: 50
        });

        if (res.success && res.data.length > 0) {
            setData(prev => [...prev, ...res.data]);
            setHasMore(res.data.length === 50);
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
