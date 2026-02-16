import type React from 'react';
import { MaterialCatalogDialog } from '@/features/catalog/components/MaterialCatalogDialog.client';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
    cleanup();
});

vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, onOpenChange }: { children: React.ReactNode; onOpenChange: (open: boolean) => void }) => (
        <div>
            <button type="button" onClick={() => onOpenChange(false)}>close</button>
            {children}
        </div>
    ),
    DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => <div data-testid="dialog-content" className={className}>{children}</div>,
    DialogHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => <div data-testid="dialog-header" className={className}>{children}</div>,
    DialogTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => <h2 className={className}>{children}</h2>,
    DialogDescription: ({ children, className }: { children: React.ReactNode; className?: string }) => <p className={className}>{children}</p>,
}));

vi.mock('@/features/catalog/components/MaterialCatalogPicker.client', () => ({
    MaterialCatalogPicker: () => <div>picker</div>,
}));

describe('MaterialCatalogDialog', () => {
    it('uses responsive classes for mobile and desktop layouts', () => {
        render(
            <MaterialCatalogDialog
                isOpen
                onClose={vi.fn()}
                onSelect={vi.fn()}
                parentWorkName="Глобальные закупки"
            />, 
        );

        expect(screen.getByTestId('dialog-content').className).toContain('h-[100dvh]');
        expect(screen.getByTestId('dialog-content').className).toContain('sm:h-[86vh]');
        expect(screen.getByTestId('dialog-content').className).toContain('sm:max-w-[1260px]');
        expect(screen.getByTestId('dialog-content').className).toContain('rounded-none');
        expect(screen.getByTestId('dialog-header').className).toContain('p-4');
        expect(screen.getByText(/Добавить материал в:/i).className).toContain('text-base');
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
});
