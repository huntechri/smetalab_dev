import { searchWorks } from '@/app/actions/works';
import { fetchMoreWorks } from '@/app/actions/works/search';
import { WorkRow } from '@/shared/types/domain/work-row';
import { useGuideTableSearch } from '@/shared/hooks/use-guide-table-search';

export function useWorksSearch(
    initialData: WorkRow[],
    data: WorkRow[],
    setData: React.Dispatch<React.SetStateAction<WorkRow[]>>
) {
    return useGuideTableSearch<WorkRow, { lastSortOrder?: number; limit: number }, { category?: string; phase?: string }>({
        initialData,
        data,
        setData,
        aiSearch: async (query: string, _filters) => {
            const result = await searchWorks(query);
            return {
                success: result.success,
                data: "data" in result ? result.data as WorkRow[] : [],
                message: result.message,
            };
        },
        searchPage: ({ query, category, phase }) => fetchMoreWorks({ query, category, phase }),
        loadMorePage: ({ query, lastSortOrder, limit, category, phase }) => fetchMoreWorks({ query, lastSortOrder, limit, category, phase }),
        getCursorFromLast: (lastItem, { category, phase }) => ({ lastSortOrder: lastItem?.sortOrder, limit: 50, category, phase }),
    });
}
