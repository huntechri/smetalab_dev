import { DataTable } from "@/shared/ui/data-table";
import { columns } from "./columns";
import { MaterialRow } from '@/types/material-row';

interface MaterialsTableWrapperProps {
    data: MaterialRow[];
    isAiMode: boolean;
    isSearching: boolean;
    searchTerm: string;
    onSearch: (query: string) => void;
    onAiModeChange: (val: boolean) => void;
    onSearchValueChange: (val: string) => void;
    onEndReached?: () => void;
    actions?: React.ReactNode;
    tableActions: {
        onInsertRequest: (afterId?: string) => void;
        onCancelInsert: () => void;
        onSaveInsert: (id: string) => void;
        updatePlaceholderRow: (id: string, partial: Partial<MaterialRow>) => void;
        setEditingRow?: (row: MaterialRow | null) => void;
        setDeletingRow?: (row: MaterialRow | null) => void;
    };
}

export function MaterialsTableWrapper({
    data,
    isAiMode,
    isSearching,
    searchTerm,
    onSearch,
    onAiModeChange,
    onSearchValueChange,
    onEndReached,
    actions,
    tableActions
}: MaterialsTableWrapperProps) {
    return (
        <DataTable
            columns={columns}
            data={data}
            height="600px"
            filterColumn="name"
            filterPlaceholder="Поиск по наименованию..."
            showAiSearch={true}
            onSearch={onSearch}
            isAiMode={isAiMode}
            onAiModeChange={onAiModeChange}
            isSearching={isSearching}
            externalSearchValue={searchTerm}
            onSearchValueChange={onSearchValueChange}
            onEndReached={onEndReached}
            actions={actions}
            meta={{
                onInsertRequest: tableActions.onInsertRequest,
                onCancelInsert: tableActions.onCancelInsert,
                onSaveInsert: tableActions.onSaveInsert,
                updatePlaceholderRow: tableActions.updatePlaceholderRow,
                setEditingRow: tableActions.setEditingRow,
                setDeletingRow: tableActions.setDeletingRow,
            }}
        />
    );
}
