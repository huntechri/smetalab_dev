import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
    stories: [
        "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
        "../app/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    ],
    addons: [
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
        "@storybook/addon-onboarding",
    ],
    framework: {
        name: "@storybook/nextjs",
        options: {},
    },
    docs: {
        autodocs: true,
    },
    staticDirs: ["../public"],
};
export default config;
