import * as React from 'react';
import { DataTable } from "@/shared/ui/data-table";
import { columns } from "./columns";
import { WorkRow } from '@/types/work-row';

interface WorksTableWrapperProps {
    data: WorkRow[];
    isAiMode: boolean;
    isSearching: boolean;
    loadingMore: boolean;
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
        updatePlaceholderRow: (id: string, partial: Partial<WorkRow>) => void;
        onReorder?: () => void;
        setEditingRow?: (row: WorkRow | null) => void;
        setDeletingRow?: (row: WorkRow | null) => void;
    };
}

export function WorksTableWrapper({
    data,
    isAiMode,
    isSearching,
    loadingMore,
    searchTerm,
    onSearch,
    onAiModeChange,
    onSearchValueChange,
    onEndReached,
    actions,
    tableActions
}: WorksTableWrapperProps) {
    const [tableHeight, setTableHeight] = React.useState("720px");

    React.useEffect(() => {
        const updateHeight = () => {
            // 400px is roughly 6 rows + header
            setTableHeight(window.innerWidth < 768 ? "400px" : "720px");
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    return (
        <DataTable
            columns={columns}
            data={data}
            height={tableHeight}
            className="text-[12px]"
            filterInputClassName="bg-transparent border border-[hsl(240_5.9%_90%_/_0.7)] rounded-[7.6px] shadow-none font-[Manrope] text-[14px] leading-[21px] font-medium placeholder:text-[14px] px-2 py-0 hover:bg-[hsl(240_4.7%_96%_/_0.82)]"
            filterColumn="name"
            filterPlaceholder="Поиск по наименованию..."
            showAiSearch={true}
            onSearch={onSearch}
            isAiMode={isAiMode}
            onAiModeChange={onAiModeChange}
            isSearching={isSearching}
            loadingMore={loadingMore}
            externalSearchValue={searchTerm}
            onSearchValueChange={onSearchValueChange}
            onEndReached={onEndReached}
            actions={actions}
            meta={{
                onInsertRequest: tableActions.onInsertRequest,
                onCancelInsert: tableActions.onCancelInsert,
                onSaveInsert: tableActions.onSaveInsert,
                updatePlaceholderRow: tableActions.updatePlaceholderRow,
                onReorder: tableActions.onReorder,
                setEditingRow: tableActions.setEditingRow,
                setDeletingRow: tableActions.setDeletingRow,
            }}
        />
    );
}
