if (typeof window !== "undefined" && !window.process) { window.process = { env: {} } as { env: Record<string, string | undefined> }; }
import type { Preview } from "@storybook/react";
import React from "react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { TooltipProvider } from "../components/ui/tooltip";
import { MockSWRWrapper } from "./mocks";
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
        withThemeByClassName({
            themes: {
                light: "",
                dark: "dark",
            },
            defaultTheme: "light",
        }),
        (Story) => (
            <MockSWRWrapper>
                <TooltipProvider>
                    <style>
                        {`
                *, *::before, *::after {
                  transition: none !important;
                  animation: none !important;
                }
              `}
                    </style>
                    <div style={{ padding: '1rem' }} className="bg-background text-foreground min-h-screen">
                        <Story />
                    </div>
                </TooltipProvider>
            </MockSWRWrapper>
        ),
    ],
};

export default preview;
