import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        reporters: ['default', 'junit'],
        outputFile: {
            junit: 'test-results/junit-api.xml',
        },
        environment: 'node',
        alias: {
            '@': path.resolve(__dirname, './'),
            'server-only': path.resolve(__dirname, './__tests__/__mocks__/server-only.ts'),
        },
        include: [
            '__tests__/api/**/*.{test,spec}.{ts,tsx}',
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
        sequence: {
            concurrent: true,
        },
    },
});
