import type { Preview } from "@storybook/react";
import React from "react";
import "../app/globals.css";

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        layout: 'fullscreen',
    },
    decorators: [
        (Story: React.ComponentType) => (
            <>
                <style>
                    {`
            *, *::before, *::after {
              transition: none !important;
              animation: none !important;
            }
          `}
                </style>
                <div style={{ padding: '1rem' }}>
                    <Story />
                </div>
            </>
        ),
    ],
};

export default preview;
