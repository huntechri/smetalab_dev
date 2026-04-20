import { render, screen } from '@testing-library/react';
import { Button } from '@/shared/ui/button';
import { describe, it, expect } from 'vitest';

describe('Button Component', () => {
  it('renders correctly with child text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies canonical base styles', () => {
    render(<Button>Test</Button>);
    const button = screen.getByRole('button', { name: 'Test' });
    expect(button).toHaveClass('inline-flex');
    expect(button).toHaveClass('h-7');
  });

  it('sets variant and size data attributes', () => {
    render(
      <Button variant="destructive" size="icon-sm">
        Delete
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toHaveAttribute('data-variant', 'destructive');
    expect(button).toHaveAttribute('data-size', 'icon-sm');
  });

  it('supports loading state via base button api', () => {
    render(
      <Button isLoading loadingText="Сохраняем...">
        Сохранить
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Сохраняем...' });
    expect(button).toBeDisabled();
    expect(screen.getByText('Сохраняем...')).toBeInTheDocument();
  });
});
