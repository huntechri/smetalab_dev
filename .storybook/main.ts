import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../components/**/*.stories.@(js|jsx|mjs|ts|tsx)", "../app/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-links",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: ["../public"],
  viteFinal: async (config) => {
    return mergeConfig(config, {
      resolve: {
        alias: [
          // specific regexes first
          { find: /^@\/lib\/db\/drizzle$/, replacement: path.resolve(__dirname, "./actions-mock.tsx") },
          { find: /^@\/lib\/db\/queries$/, replacement: path.resolve(__dirname, "./queries-mock.tsx") },
          { find: /^@\/app\/\(login\)\/actions$/, replacement: path.resolve(__dirname, "./actions-mock.tsx") },
          { find: /^\.\/actions$/, replacement: path.resolve(__dirname, "./actions-mock.tsx") }, // for relative imports in (login)
          { find: /^next\/navigation$/, replacement: path.resolve(__dirname, "./mocks.tsx") },
          { find: /^next\/link$/, replacement: path.resolve(__dirname, "./mocks.tsx") },
          { find: /^next\/headers$/, replacement: path.resolve(__dirname, "./mocks.tsx") },
          { find: /^next\/cache$/, replacement: path.resolve(__dirname, "./mocks.tsx") },
          { find: /^next\/config$/, replacement: path.resolve(__dirname, "./mocks.tsx") },
          { find: /^postgres$/, replacement: path.resolve(__dirname, "./actions-mock.tsx") },
          { find: /^perf_hooks$/, replacement: path.resolve(__dirname, "./mocks.tsx") },
          { find: "@", replacement: path.resolve(__dirname, "..") },
        ],
      },
      define: {
        "process.env": {},
      },
    });
  },
};

export default config;
