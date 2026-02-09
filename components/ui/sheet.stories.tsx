import type { Meta, StoryObj } from '@storybook/react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from './sheet';
import { Button } from './button';

const meta: Meta<typeof Sheet> = {
    title: 'UI/Sheet',
    component: Sheet,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Right: Story = {
    render: () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Open Right</Button>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Edit profile</SheetTitle>
                    <SheetDescription>
                        Make changes to your profile here. Click save when you're done.
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    ),
};

export const Left: Story = {
    render: () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Open Left</Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Edit profile</SheetTitle>
                    <SheetDescription>
                        Make changes to your profile here. Click save when you're done.
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    ),
};
