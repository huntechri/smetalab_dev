import { searchWorks } from '@/app/actions/works';
import { fetchMoreWorks } from '@/app/actions/works/search';
import { WorkRow } from '@/types/work-row';
import { useGuideTableSearch } from '@/hooks/use-guide-table-search';

export function useWorksSearch(
    initialData: WorkRow[],
    data: WorkRow[],
    setData: React.Dispatch<React.SetStateAction<WorkRow[]>>
) {
    return useGuideTableSearch<WorkRow, { lastSortOrder?: number; limit: number }>({
        initialData,
        data,
        setData,
        aiSearch: async (query: string) => {
            const result = await searchWorks(query);
            return {
                success: result.success,
                data: "data" in result ? result.data : [],
                message: result.message,
            };
        },
        searchPage: ({ query }) => fetchMoreWorks({ query }),
        loadMorePage: ({ query, lastSortOrder, limit }) => fetchMoreWorks({ query, lastSortOrder, limit }),
        getCursorFromLast: (lastItem) => ({ lastSortOrder: lastItem?.sortOrder, limit: 50 }),
    });
}
