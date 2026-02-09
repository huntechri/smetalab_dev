import type { Meta, StoryObj } from '@storybook/react';
import DashboardPage from './page';

const meta: Meta<typeof DashboardPage> = {
    title: 'Screens/Dashboard',
    component: DashboardPage,
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof DashboardPage>;

export const Default: Story = {};
