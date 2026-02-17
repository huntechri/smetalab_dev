import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'node',
        alias: {
            '@': path.resolve(__dirname, './'),
            'server-only': path.resolve(__dirname, './__tests__/__mocks__/server-only.ts'),
        },
        include: ['__tests__/integration/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules/**/*', '__tests__/e2e/**/*'],
        setupFiles: ['./vitest.setup.ts'],
        testTimeout: 60000,
        maxWorkers: 1,
        fileParallelism: false,
        sequence: {
            concurrent: false,
        },
    },
});
