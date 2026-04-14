import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.mjs"],
        languageOptions: {
            parser: tsparser,
            parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
            globals: { ...globals.browser, ...globals.node, React: "readonly", JSX: "readonly" },
        },
        plugins: { "@typescript-eslint": tseslint },
        rules: {
            ...tseslint.configs.recommended.rules,
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
            "no-unused-vars": "off",
            "no-case-declarations": "off",
        },
    },

    {
        files: ["shared/ui/auto-form/**/*.{ts,tsx}"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
    {
        files: ["shared/ui/**/*.{ts,tsx,js,jsx}"],
        rules: {
            "no-restricted-imports": ["error", { patterns: ["@/app/*", "@/features/*", "@/lib/domain/*", "@/lib/data/*"] }],
        },
    },
    {
        files: ["lib/domain/**/use-cases.{ts,tsx,js,jsx}"],
        rules: {
            "no-restricted-imports": ["error", { paths: ["react", "zustand"], patterns: ["next/*", "@tanstack/*", "@/components/*", "@/features/*", "node:*", "drizzle-orm", "drizzle-orm/*"] }],
        },
    },
    {
        files: ["lib/data/**/*.{ts,tsx,js,jsx}"],
        rules: {
            "no-restricted-imports": ["error", { patterns: ["@/components/*", "@/features/*"] }],
        },
    },
    {
        files: ["app/**/*.{tsx,jsx}", "features/**/*.{tsx,jsx}", "components/**/*.{tsx,jsx}"],
        ignores: ["shared/ui/**/*", "__tests__/**/*", "app/(login)/login.tsx", "app/(admin)/terminal.tsx"],
        rules: {
            "no-restricted-syntax": [
                "error",
                {
                    selector: "JSXOpeningElement[name.name='button']",
                    message: "Use shadcn Button from '@/shared/ui/button' instead of raw <button> in app code.",
                },
                {
                    selector: "JSXOpeningElement[name.name='table']",
                    message: "Use shadcn Table primitives from '@/shared/ui/table' instead of raw <table> in app code.",
                },
            ],
        },
    },
    {
        files: [
            "lib/data/db/seed.ts",
            "lib/data/db/seed-permissions.ts",
            "lib/data/db/assign-role.ts",
            "lib/data/db/reset-password.ts",
            "lib/data/db/create-user.ts",
            "lib/data/db/test-utils.ts",
        ],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    paths: [
                        "./drizzle",
                        "./drizzle.server",
                        "@/lib/data/db/drizzle",
                        "@/lib/data/db/drizzle.server",
                    ],
                },
            ],
        },
    },
    { ignores: ["node_modules/**", ".next/**", ".vercel/**", "drizzle/**", "bin/**", "test-results/**"] },
];
