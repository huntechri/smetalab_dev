import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './switch';
import { Label } from './label';
import { useState } from 'react';

const meta: Meta<typeof Switch> = {
    title: 'UI/Switch',
    component: Switch,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
    render: () => {
        const [checked, setChecked] = useState(false);
        return (
            <div className="flex items-center space-x-2">
                <Switch
                    id="airplane-mode"
                    checked={checked}
                    onCheckedChange={setChecked}
                />
                <Label htmlFor="airplane-mode">Airplane Mode</Label>
            </div>
        );
    }
};
