import React from 'react';
import type { Preview } from "@storybook/react";
import "../app/globals.css";

// Polyfill for process.env in the browser
if (typeof window !== 'undefined') {
  (window as any).process = {
    env: {
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_mock',
    },
    cwd: () => '/',
  };
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <div className="antialiased">
        <Story />
      </div>
    ),
  ],
};

export default preview;
