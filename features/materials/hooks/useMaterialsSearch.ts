import { searchMaterials, fetchMoreMaterials } from '@/app/actions/materials';
import { MaterialRow } from '@/shared/types/domain/material-row';
import { useGuideTableSearch } from '@/shared/hooks/use-guide-table-search';

export function useMaterialsSearch(
    initialData: MaterialRow[],
    data: MaterialRow[],
    setData: React.Dispatch<React.SetStateAction<MaterialRow[]>>
) {
    return useGuideTableSearch<
        MaterialRow, 
        { lastSortOrder?: number; lastId?: string }, 
        { 
            categoryLv1?: string; 
            categoryLv2?: string; 
            categoryLv3?: string; 
            categoryLv4?: string 
        }
    >({
        initialData,
        data,
        setData,
        aiSearch: async (query: string, filters) => {
            const result = await searchMaterials({ query, ...filters });
            return {
                success: result.success,
                data: result.success ? result.data : [],
                message: result.message,
            };
        },
        searchPage: (args) => fetchMoreMaterials(args),
        loadMorePage: ({ query, lastSortOrder, lastId, ...filters }) =>
            fetchMoreMaterials({
                query,
                ...filters,
                cursor: typeof lastSortOrder === 'number' && lastId ? { lastSortOrder, lastId } : undefined,
            }),
        getCursorFromLast: (lastItem) => ({ 
            lastSortOrder: lastItem?.sortOrder ? Number(lastItem.sortOrder) : undefined, 
            lastId: lastItem?.id 
        }),
    });
}
