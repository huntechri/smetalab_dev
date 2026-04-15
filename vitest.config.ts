import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        alias: {
            '@': path.resolve(__dirname, './'),
            'server-only': path.resolve(__dirname, './__tests__/__mocks__/server-only.ts'),
        },
        include: [
            '__tests__/unit/**/*.{test,spec}.{ts,tsx}',
            '__tests__/ui/**/*.{test,spec}.{ts,tsx}',
            '__tests__/api/**/*.{test,spec}.{ts,tsx}',
            '__tests__/performance/**/*.{test,spec}.{ts,tsx}',
            '__tests__/rbac_perf.test.ts',
        ],
        exclude: [
            'node_modules/**/*',
            '__tests__/e2e/**/*',
            '**/__tests__/integration/**',
        ],
        setupFiles: ['./vitest.setup.ts'],
        testTimeout: 30000,
        fileParallelism: false,
        sequence: {
            concurrent: false,
        },
    },
});
