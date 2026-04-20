/**
 * Mock implementation for react-virtuoso
 * Renders all items without virtualization for testing purposes
 */
import React from 'react';

interface TableVirtuosoProps<T> {
    data: T[];
    components?: {
        Table?: React.ComponentType<{ style?: React.CSSProperties; context?: unknown; children?: React.ReactNode }>;
        TableHead?: React.ComponentType<{ context?: unknown; children?: React.ReactNode }>;
        TableRow?: React.ComponentType<{ context?: unknown; children?: React.ReactNode; 'data-index'?: number; 'data-item-index'?: number }>;
        TableBody?: React.ComponentType<{ context?: unknown; children?: React.ReactNode; 'data-testid'?: string }>;
        EmptyPlaceholder?: React.ComponentType<{ context?: unknown }>;
    };
    fixedHeaderContent?: () => React.ReactNode;
    itemContent?: (index: number, item: T, context?: unknown) => React.ReactNode;
    context?: unknown;
    style?: React.CSSProperties;
    className?: string;
    endReached?: () => void;
    overscan?: number;
}

export function TableVirtuoso<T>({
    data,
    components,
    fixedHeaderContent,
    itemContent,
    context,
    style,
}: TableVirtuosoProps<T>) {
    // Use custom components if provided, otherwise fallback to native elements
    const TableComponent = components?.Table;
    const TableHeadComponent = components?.TableHead;
    const TableBodyComponent = components?.TableBody;
    const TableRowComponent = components?.TableRow;
    const EmptyPlaceholder = components?.EmptyPlaceholder;

    // If we have custom components, use them with context
    if (TableComponent && TableHeadComponent && TableBodyComponent && TableRowComponent) {
        return (
            <TableComponent style={style} context={context}>
                <TableHeadComponent context={context}>
                    {fixedHeaderContent?.()}
                </TableHeadComponent>
                <TableBodyComponent context={context} data-testid="virtuoso-item-list">
                    {data.length === 0 && EmptyPlaceholder ? (
                        <EmptyPlaceholder context={context} />
                    ) : (
                        data.map((item, index) => (
                            <TableRowComponent
                                key={index}
                                context={context}
                                data-index={index}
                                data-item-index={index}
                            >
                                {itemContent?.(index, item, context)}
                            </TableRowComponent>
                        ))
                    )}
                </TableBodyComponent>
            </TableComponent>
        );
    }

    // Fallback to native HTML elements (for simpler testing scenarios)
    return (
        <table style={style}>
            <thead>
                {fixedHeaderContent?.()}
            </thead>
            <tbody data-testid="virtuoso-item-list">
                {data.length === 0 && EmptyPlaceholder ? (
                    <EmptyPlaceholder context={context} />
                ) : (
                    data.map((item, index) => (
                        <tr key={index} data-index={index}>
                            {itemContent?.(index, item, context)}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
}

interface VirtuosoProps<T> {
    data: T[];
    itemContent?: (index: number, item: T) => React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    endReached?: () => void;
    overscan?: number;
}

export function Virtuoso<T>({
    data,
    itemContent,
    style,
    className,
}: VirtuosoProps<T>) {
    return (
        <div style={style} className={className} data-testid="virtuoso-scroller">
            {data.map((item, index) => (
                <div key={index} data-index={index}>
                    {itemContent?.(index, item)}
                </div>
            ))}
        </div>
    );
}

// Mock TableComponents type matching react-virtuoso's signature
export type TableComponents<C = unknown> = {
    Table?: React.ComponentType<{ style?: React.CSSProperties; context?: C; children?: React.ReactNode }>;
    TableHead?: React.ForwardRefExoticComponent<React.RefAttributes<HTMLTableSectionElement> & { context?: C; children?: React.ReactNode }>;
    TableRow?: React.ComponentType<{ context?: C; children?: React.ReactNode; 'data-index'?: number; 'data-item-index'?: number }>;
    TableBody?: React.ForwardRefExoticComponent<React.RefAttributes<HTMLTableSectionElement> & { context?: C; children?: React.ReactNode; 'data-testid'?: string }>;
    EmptyPlaceholder?: React.ComponentType<{ context?: C }>;
};

export default { TableVirtuoso, Virtuoso };
