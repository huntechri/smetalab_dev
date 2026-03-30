import * as React from 'react';
import { DataTable } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/button";
import { Plus, FilePlus } from "lucide-react";
import { TableEmptyState } from "@/shared/ui/table-empty-state";
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
            filterInputClassName="bg-white h-8 border border-border rounded-[7.6px] shadow-none text-[14px] font-medium leading-[20px] px-2 py-0 transition-all hover:bg-secondary/50 focus-visible:border-primary/40 placeholder:text-[12px]"
            filterColumn="name"
            filterPlaceholder="Поиск..."
            emptyState={
                <TableEmptyState
                    title="Справочник работ пуст"
                    description="Добавьте первую работу или импортируйте базу работ из файла"
                    icon={FilePlus}
                    action={
                        <Button
                            variant="standard"
                            className="h-8 rounded-[7.6px] px-6 font-medium"
                            onClick={() => tableActions.onInsertRequest()}
                        >
                            <Plus className="size-3.5 mr-2" />
                            Добавить работу
                        </Button>
                    }
                />
            }
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
