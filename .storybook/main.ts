import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";

const config: StorybookConfig = {
    stories: [
        "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
        "../app/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    ],
    addons: [
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
        "@storybook/addon-onboarding",
        "@storybook/addon-themes",
    ],
    framework: {
        name: "@storybook/react-vite",
        options: {},
    },
    docs: {
        autodocs: true,
    },
    staticDirs: ["../public"],
    async viteFinal(config) {
        if (config.resolve) {
            config.resolve.alias = {
                ...config.resolve.alias,
                "@": path.resolve(__dirname, "../"),
                "next/link": path.resolve(__dirname, "./mocks.tsx"),
                "next/navigation": path.resolve(__dirname, "./mocks.tsx"),
                "next/headers": path.resolve(__dirname, "./mocks.tsx"),
                "next/cache": path.resolve(__dirname, "./mocks.tsx"),
                "postgres": path.resolve(__dirname, "./actions-mock.tsx"),
                "@/lib/db/drizzle": path.resolve(__dirname, "./actions-mock.tsx"),
            };
        }
        if (config.define) {
            config.define["process.env"] = {};
        } else {
            config.define = { "process.env": {} };
        }
        return config;
    },
};
export default config;
