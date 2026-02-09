import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';
import { Input } from './input';

const meta: Meta<typeof Label> = {
    title: 'UI/Label',
    component: Label,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
    render: () => (
        <div>
            <div className="flex items-center space-x-2">
                <Label htmlFor="email">Your email address</Label>
            </div>
            <Input type="email" id="email" placeholder="Email" className="mt-2" />
        </div>
    ),
};
