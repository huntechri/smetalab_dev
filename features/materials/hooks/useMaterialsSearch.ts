import { searchMaterials, fetchMoreMaterials } from '@/app/actions/materials';
import { MaterialRow } from '@/types/material-row';
import { useGuideTableSearch } from '@/hooks/use-guide-table-search';

export function useMaterialsSearch(
    initialData: MaterialRow[],
    data: MaterialRow[],
    setData: React.Dispatch<React.SetStateAction<MaterialRow[]>>
) {
    return useGuideTableSearch<MaterialRow, { lastCode?: string; lastId?: string }>({
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
        loadMorePage: ({ query, lastCode, lastId }) =>
            fetchMoreMaterials({ query, cursor: lastCode && lastId ? { lastCode, lastId } : undefined }),
        getCursorFromLast: (lastItem) => ({ lastCode: lastItem?.code, lastId: lastItem?.id }),
    });
}
