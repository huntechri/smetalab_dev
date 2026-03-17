import { searchMaterials, fetchMoreMaterials } from '@/app/actions/materials';
import { MaterialRow } from '@/types/material-row';
import { useGuideTableSearch } from '@/hooks/use-guide-table-search';

export function useMaterialsSearch(
    initialData: MaterialRow[],
    data: MaterialRow[],
    setData: React.Dispatch<React.SetStateAction<MaterialRow[]>>
) {
    return useGuideTableSearch<MaterialRow, { lastSortOrder?: number; lastId?: string }>({
        initialData,
        data,
        setData,
        aiSearch: async (query: string) => {
            const result = await searchMaterials(query);
            return {
                success: result.success,
                data: "data" in result ? result.data : [],
                message: result.message,
            };
        },
        searchPage: ({ query }) => fetchMoreMaterials({ query }),
        loadMorePage: ({ query, lastSortOrder, lastId }) =>
            fetchMoreMaterials({
                query,
                cursor: typeof lastSortOrder === 'number' && lastId ? { lastSortOrder, lastId } : undefined,
            }),
        getCursorFromLast: (lastItem) => ({ lastSortOrder: lastItem?.sortOrder, lastId: lastItem?.id }),
    });
}
