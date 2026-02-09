import type { Meta, StoryObj } from '@storybook/react';
import { CounterpartiesClient } from './CounterpartiesClient';

const meta: Meta<typeof CounterpartiesClient> = {
    title: 'Screens/Counterparties',
    component: CounterpartiesClient,
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof CounterpartiesClient>;

export const Default: Story = {
    args: {
        initialData: [
            {
                id: '1',
                name: 'ООО "Петрович"',
                type: 'supplier',
                legalStatus: 'company',
                inn: '1234567890',
                kpp: '123456789',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            },
            {
                id: '2',
                name: 'ИП Иванов И.И.',
                type: 'contractor',
                legalStatus: 'individual',
                inn: '0987654321',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            },
        ],
        totalCount: 2,
        tenantId: 1,
    },
};
