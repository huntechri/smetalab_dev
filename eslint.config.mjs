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
        files: ["components/ui/**/*.{ts,tsx,js,jsx}"],
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
    { ignores: ["node_modules/**", ".next/**", "bin/**", "test-results/**"] },
];
