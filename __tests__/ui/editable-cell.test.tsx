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

    it('applies caller className to the display button', () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        render(<EditableCell value="Test" onCommit={onCommit} className="my-custom-class" />);

        const button = screen.getByRole('button', { name: 'Test' });
        expect(button).toHaveClass('my-custom-class');
    });

    it('click switches from display mode to input', async () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        render(<EditableCell value="Hello" onCommit={onCommit} />);

        expect(screen.getByRole('button', { name: 'Hello' })).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Hello' }));

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('commits value on Enter and returns to display mode', async () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        render(<EditableCell value="Original" onCommit={onCommit} />);

        await userEvent.click(screen.getByRole('button', { name: 'Original' }));

        const input = screen.getByRole('textbox');
        await userEvent.clear(input);
        await userEvent.type(input, 'Updated{Enter}');

        await waitFor(() => {
            expect(onCommit).toHaveBeenCalledWith('Updated');
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    it('commits value on blur and returns to display mode', async () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        render(<EditableCell value="Original" onCommit={onCommit} />);

        await userEvent.click(screen.getByRole('button', { name: 'Original' }));

        const input = screen.getByRole('textbox');
        await userEvent.clear(input);
        await userEvent.type(input, 'Blurred');
        fireEvent.blur(input);

        await waitFor(() => {
            expect(onCommit).toHaveBeenCalledWith('Blurred');
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    it('cancels edit on Escape and restores original value', async () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        render(<EditableCell value="Original" onCommit={onCommit} />);

        await userEvent.click(screen.getByRole('button', { name: 'Original' }));

        const input = screen.getByRole('textbox');
        await userEvent.clear(input);
        await userEvent.type(input, 'Changed');
        await userEvent.keyboard('{Escape}');

        await waitFor(() => {
            expect(onCommit).not.toHaveBeenCalled();
            expect(screen.getByRole('button', { name: 'Original' })).toBeInTheDocument();
        });
    });

    it('renders a pencil icon inside the display button in non-editing state', () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        const { container } = render(<EditableCell value="Test" onCommit={onCommit} />);

        const button = screen.getByRole('button', { name: 'Test' });
        expect(button).toBeInTheDocument();

        const pencilIcon = container.querySelector('svg');
        expect(pencilIcon).not.toBeNull();
        expect(button.contains(pencilIcon)).toBe(true);

        expect(button).toMatchSnapshot();
    });

    it('pencil icon carries keyboard-focus and hover visibility classes', () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        const { container } = render(<EditableCell value="Test" onCommit={onCommit} />);

        const pencilIcon = container.querySelector('svg');
        expect(pencilIcon).not.toBeNull();
        expect(pencilIcon).toHaveClass('group-focus-visible:opacity-40');
        expect(pencilIcon).toHaveClass('group-hover:opacity-40');
    });

    it('pencil icon starts hidden via opacity-0 in display mode', () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        const { container } = render(<EditableCell value="Test" onCommit={onCommit} />);

        const pencilIcon = container.querySelector('svg');
        expect(pencilIcon).not.toBeNull();
        expect(pencilIcon).toHaveClass('opacity-0');
    });

    it('pencil icon carries transition-opacity in display mode', () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        const { container } = render(<EditableCell value="Test" onCommit={onCommit} />);

        const pencilIcon = container.querySelector('svg');
        expect(pencilIcon).not.toBeNull();
        expect(pencilIcon).toHaveClass('transition-opacity');
    });

    it('pencil icon is absent in edit mode', async () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        const { container } = render(<EditableCell value="Test" onCommit={onCommit} />);

        await userEvent.click(screen.getByRole('button', { name: 'Test' }));

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(container.querySelector('svg')).toBeNull();
    });

    it('disabled cell does not open input when clicked', async () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        render(<EditableCell value="Locked" onCommit={onCommit} disabled />);

        const button = screen.getByRole('button', { name: 'Locked' });
        expect(button).toBeDisabled();

        await userEvent.click(button, { pointerEventsCheck: 0 });

        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(onCommit).not.toHaveBeenCalled();
    });

    it('display button carries all focus-visible Tailwind classes for keyboard users', () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        render(<EditableCell value="Cell" onCommit={onCommit} />);

        const button = screen.getByRole('button', { name: 'Cell' });
        expect(button).toHaveClass('focus-visible:bg-accent');
        expect(button).toHaveClass('focus-visible:text-accent-foreground');
        expect(button).toHaveClass('focus-visible:underline');
        expect(button).toHaveClass('focus-visible:decoration-dashed');
        expect(button).toHaveClass('focus-visible:underline-offset-2');
    });

    it('display button carries all hover Tailwind classes for mouse users', () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        render(<EditableCell value="Cell" onCommit={onCommit} />);

        const button = screen.getByRole('button', { name: 'Cell' });
        expect(button).toHaveClass('hover:bg-accent');
        expect(button).toHaveClass('hover:text-accent-foreground');
        expect(button).toHaveClass('hover:underline');
        expect(button).toHaveClass('hover:decoration-dashed');
        expect(button).toHaveClass('hover:underline-offset-2');
    });

    it('display button carries aria-label from ariaLabel prop before any click', () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        render(
            <EditableCell
                value="42"
                onCommit={onCommit}
                ariaLabel="Item quantity"
            />,
        );

        const button = screen.getByRole('button', { name: 'Item quantity' });
        expect(button).toHaveAttribute('aria-label', 'Item quantity');
    });

    it('input receives the ariaLabel prop as aria-label when in edit mode', async () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);

        render(
            <EditableCell
                value="Description"
                onCommit={onCommit}
                ariaLabel="Edit item description"
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Edit item description' }));

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('aria-label', 'Edit item description');
    });
});
