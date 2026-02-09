import type { Meta, StoryObj } from '@storybook/react';
import { LoadingButton } from './loading-button';

const meta: Meta<typeof LoadingButton> = {
    title: 'UI/LoadingButton',
    component: LoadingButton,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LoadingButton>;

export const Default: Story = {
    args: {
        children: 'Click me',
        isLoading: false,
    },
};

export const Loading: Story = {
    args: {
        children: 'Submit',
        isLoading: true,
        loadingText: 'Submitting...',
    },
};
