import type React from 'react';
import { MaterialCatalogDialog } from '@/features/catalog/components/MaterialCatalogDialog.client';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
    cleanup();
});

vi.mock('@/shared/ui/dialog', () => ({
    Dialog: ({ children, onOpenChange }: { children: React.ReactNode; onOpenChange: (open: boolean) => void }) => (
        <div>
            <button type="button" onClick={() => onOpenChange(false)}>close</button>
            {children}
        </div>
    ),
    DialogContent: ({
        children,
        className,
        layout,
        size,
    }: {
        children: React.ReactNode;
        className?: string;
        layout?: string;
        size?: string;
    }) => (
        <div data-testid="dialog-content" data-layout={layout} data-size={size} className={className}>
            {children}
        </div>
    ),
    DialogHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => <div data-testid="dialog-header" className={className}>{children}</div>,
    DialogTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => <h2 className={className}>{children}</h2>,
    DialogDescription: ({ children, className }: { children: React.ReactNode; className?: string }) => <p className={className}>{children}</p>,
}));

vi.mock('@/features/catalog/components/MaterialCatalogPicker.client', () => ({
    MaterialCatalogPicker: ({ onAddMaterial }: { onAddMaterial: (material: { id: string; name: string; unit: string; price: string }) => Promise<void> }) => (
        <button
            type="button"
            onClick={() => void onAddMaterial({ id: '1', name: 'Песок', unit: 'м3', price: '1000' })}
        >
            add material
        </button>
    ),
}));

describe('MaterialCatalogDialog', () => {
    it('uses the shared catalog picker layout contract', () => {
        render(
            <MaterialCatalogDialog
                isOpen
                onClose={vi.fn()}
                onSelect={vi.fn()}
                parentWorkName="Глобальные закупки"
            />,
        );

        const content = screen.getByTestId('dialog-content');

        expect(content).toHaveAttribute('data-size', 'catalog-picker');
        expect(content).toHaveAttribute('data-layout', 'edge-to-edge');
        expect(content.className).toBe('');
        expect(screen.getByText(/Добавить материал в:/i)).toBeInTheDocument();
        expect(screen.getByText(/Выберите позицию из справочника материалов/i)).toBeInTheDocument();
    });

    it('calls onClose when dialog is dismissed', () => {
        const onClose = vi.fn();

        render(
            <MaterialCatalogDialog
                isOpen
                onClose={onClose}
                onSelect={vi.fn()}
                parentWorkName="Глобальные закупки"
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'close' }));

        expect(onClose).toHaveBeenCalled();
    });

    it('keeps dialog open on select when closeOnSelect is false', async () => {
        const onClose = vi.fn();
        const onSelect = vi.fn().mockResolvedValue(undefined);

        render(
            <MaterialCatalogDialog
                isOpen
                onClose={onClose}
                onSelect={onSelect}
                parentWorkName="Глобальные закупки"
                closeOnSelect={false}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'add material' }));

        expect(onSelect).toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });
});
