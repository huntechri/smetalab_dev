import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        reporters: ['default', 'junit'],
        outputFile: {
            junit: 'test-results/junit-ui.xml',
        },
        environment: 'jsdom',
        alias: {
            '@': path.resolve(__dirname, './'),
            'server-only': path.resolve(__dirname, './__tests__/__mocks__/server-only.ts'),
        },
        include: [
            '__tests__/ui/**/*.{test,spec}.{ts,tsx}',
            '__tests__/unit/**/*.{test,spec}.tsx',
        ],
        exclude: [
            'node_modules/**/*',
            '__tests__/integration/**/*',
            '__tests__/e2e/**/*',
        ],
        setupFiles: ['./vitest.setup.ts'],
        passWithNoTests: true,
        testTimeout: 30000,
        fileParallelism: true,
        maxWorkers: 2,
        sequence: {
            concurrent: false,
        },
    },
});
