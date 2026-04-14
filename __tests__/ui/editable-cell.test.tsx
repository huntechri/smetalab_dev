import { EditableCell } from '@/features/projects/estimates/components/table/cells/EditableCell';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
    cleanup();
});

describe('EditableCell', () => {
    it('clears quantity on focus and restores previous value on blur when no input was provided', async () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        render(
            <EditableCell
                type="number"
                value={1}
                onCommit={onCommit}
                clearOnFocus
                cancelOnEmpty
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: '1' }));

        const input = screen.getByRole('spinbutton');
        expect(input).toHaveValue(null);

        fireEvent.blur(input);

        await waitFor(() => {
            expect(onCommit).not.toHaveBeenCalled();
            expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
        });
    });

    it('commits typed value for quantity field', async () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        render(
            <EditableCell
                type="number"
                value={1}
                onCommit={onCommit}
                clearOnFocus
                cancelOnEmpty
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: '1' }));
        const input = screen.getByRole('spinbutton');

        await userEvent.type(input, '42{Enter}');

        await waitFor(() => {
            expect(onCommit).toHaveBeenCalledWith('42');
        });
    });

    it('keeps existing value for regular text fields when editing starts', async () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        render(<EditableCell value="Работа" onCommit={onCommit} />);

        await userEvent.click(screen.getByRole('button', { name: 'Работа' }));

        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('Работа');
    });
});
