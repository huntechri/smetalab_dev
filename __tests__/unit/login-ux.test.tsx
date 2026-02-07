import { vi } from 'vitest';

// Mock window and document BEFORE any imports that might use them
if (typeof window === 'undefined') {
  const windowMock = {
    location: { href: '' },
    navigator: { userAgent: 'node.js' },
    document: {
      createElement: () => ({}),
      body: {
        appendChild: () => {},
        removeChild: () => {},
      },
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    matchMedia: () => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    }),
  };
  global.window = windowMock as unknown as Window & typeof globalThis;
  global.document = windowMock.document as unknown as Document;
}

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { Login } from '@/app/(login)/login';
import * as React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: () => null,
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock server actions
vi.mock('@/app/(login)/actions', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

// Mock useActionState
const { useActionStateMock } = vi.hoisted(() => {
  return { useActionStateMock: vi.fn() };
});

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useActionState: useActionStateMock,
  };
});

describe('Login Component UX', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useActionStateMock.mockImplementation((_state: any, _payload: any) => [
      { error: null }, // Return clean state by default
      null,
      false
    ]);
  });

  it('toggles password visibility', () => {
    // Setup clean state
    useActionStateMock.mockReturnValue([{}, null, false]);

    render(<Login mode='signin' />);

    const passwordInput = screen.getByLabelText('Пароль');
    // The button might not have a label text if aria-label is used, but getByLabelText supports aria-label
    const toggleButton = screen.getByLabelText('Показать пароль');

    // Initial state: password hidden
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    fireEvent.click(toggleButton);

    // Password should be visible
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(toggleButton).toHaveAttribute('aria-label', 'Скрыть пароль');

    // Click toggle button again
    fireEvent.click(toggleButton);

    // Password should be hidden again
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(toggleButton).toHaveAttribute('aria-label', 'Показать пароль');
  });

  it('displays error message with accessible attributes', () => {
    // Return an error state
    useActionStateMock.mockReturnValue([{ error: 'Invalid credentials' }, null, false]);

    render(<Login mode='signin' />);

    const errorDiv = screen.getByText('Invalid credentials');
    expect(errorDiv).toBeInTheDocument();
    expect(errorDiv).toHaveAttribute('role', 'alert');
    // The aria-live attribute might be on a parent or handled differently by alert role
    // Checking standard role='alert' implies assertive/polite behavior usually
    expect(errorDiv).toHaveAttribute('role', 'alert');
  });
});
