import type { Meta, StoryObj } from '@storybook/react';
import { Login } from './login';

const meta: Meta<typeof Login> = {
    title: 'Screens/Login',
    component: Login,
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof Login>;

export const SignIn: Story = {
    args: {
        mode: 'signin',
    },
};

export const SignUp: Story = {
    args: {
        mode: 'signup',
    },
};
