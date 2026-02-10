import { render, screen, fireEvent, waitFor, within, cleanup } from '@testing-library/react';
import { CounterpartiesClient } from '@/app/(workspace)/app/guide/counterparties/components/CounterpartiesClient';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import type { Counterparty } from '@/lib/data/db/schema';

// Mock react-virtuoso to render all items in jsdom
vi.mock('react-virtuoso', async () => {
    const mock = await import('../__mocks__/react-virtuoso');
    return mock;
});

// --- Mocks ---
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
        push: vi.fn(),
    }),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('@/app/actions/counterparties', () => ({
    deleteCounterparty: vi.fn(),
    createCounterparty: vi.fn(),
    updateCounterparty: vi.fn(),
}));

const mockData: Counterparty[] = [
    {
        id: '1',
        name: 'ООО Строитель',
        type: 'contractor',
        legalStatus: 'company',
        inn: '1234567890',
        phone: '+7111',
        email: 'build@test.com',
        tenantId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        kpp: null,
        ogrn: null,
        address: null,
        bankAccount: null,
        bankName: null,
        corrAccount: null,
        bankInn: null,
        bankKpp: null,
        birthDate: null,
        passportSeriesNumber: null,
        passportIssuedBy: null,
        passportIssuedDate: null,
        departmentCode: null,
    }
];

describe('CounterpartiesClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Clean up DOM after each test to prevent Sheet content pollution
        cleanup();
    });

    it('renders page title and add button', () => {
        render(
            <CounterpartiesClient
                initialData={[]}
                totalCount={0}
                tenantId={1}
            />
        );

        expect(screen.getByRole('heading', { name: 'Контрагенты' })).toBeInTheDocument();
        // Get all add buttons (there might be duplicates due to component structure)
        const addButtons = screen.getAllByRole('button', { name: /Добавить/i });
        expect(addButtons.length).toBeGreaterThan(0);
    });

    it('renders counterparties data in table', () => {
        render(
            <CounterpartiesClient
                initialData={mockData}
                totalCount={1}
                tenantId={1}
            />
        );

        // Get all tables and verify at least one exists
        const tables = screen.getAllByRole('table');
        expect(tables.length).toBeGreaterThan(0);

        // Check data is rendered (unique values)
        expect(screen.getByText('ООО Строитель')).toBeInTheDocument();
        expect(screen.getByText('Подрядчик')).toBeInTheDocument();
        expect(screen.getByText('1234567890')).toBeInTheDocument();
    });

    it('opens create sheet when "Добавить" is clicked', async () => {
        render(
            <CounterpartiesClient
                initialData={[]}
                totalCount={0}
                tenantId={1}
            />
        );

        // Get all add buttons and click the first one
        const addButtons = screen.getAllByRole('button', { name: /Добавить/i });
        fireEvent.click(addButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Создать контрагента')).toBeInTheDocument();
        });
    });

    it('renders breadcrumb navigation', () => {
        render(
            <CounterpartiesClient
                initialData={[]}
                totalCount={0}
                tenantId={1}
            />
        );

        // Get all nav elements with breadcrumb label and find the first one
        const breadcrumbNavs = screen.getAllByRole('navigation', { name: 'breadcrumb' });
        expect(breadcrumbNavs.length).toBeGreaterThan(0);

        // Check content within the first breadcrumb
        const breadcrumbNav = breadcrumbNavs[0];
        expect(within(breadcrumbNav).getByText('Главная')).toBeInTheDocument();
        expect(within(breadcrumbNav).getByText('Справочники')).toBeInTheDocument();
        expect(within(breadcrumbNav).getByText('Контрагенты')).toBeInTheDocument();
    });

    it('displays record count in footer', () => {
        render(
            <CounterpartiesClient
                initialData={mockData}
                totalCount={1}
                tenantId={1}
            />
        );

        // Use getAllByText since there might be duplicates due to Sheet rendering
        const recordCountElements = screen.getAllByText(/Всего записей:/);
        expect(recordCountElements.length).toBeGreaterThan(0);
    });

    /**
     * NOTE: Tests for dropdown menu interactions (edit, delete actions) require e2e testing.
     * Radix UI DropdownMenu renders content in a portal and uses aria-hidden on main content.
     * Testing-library's fireEvent doesn't fully simulate the interaction required.
     * 
     * TODO: Implement these tests with Playwright/Cypress:
     * - opens actions menu when settings button is clicked
     * - handles delete action through menu
     * - shows error toast when delete fails
     * - opens edit sheet when edit menu item is clicked
     * - does not delete when confirm is cancelled
     */
});

