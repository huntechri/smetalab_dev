import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@repo/ui';
import { expect, test } from 'vitest';

test('Input component renders and accepts user input', async () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Hello, World!');
    expect(input).toHaveValue('Hello, World!');
});

test('Input component uses regular density by default', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('h-9');
    expect(input).toHaveAttribute('data-size', 'default');
});

test('Input component keeps compact xs density as an explicit opt-in', () => {
    render(<Input size="xs" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('h-7');
    expect(input).toHaveAttribute('data-size', 'xs');
});
