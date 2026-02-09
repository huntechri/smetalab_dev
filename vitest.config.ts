import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        alias: {
            '@': path.resolve(__dirname, './'),
        },
        include: ['**/*.{test,spec}.{ts,tsx}'],
        exclude: [
            'node_modules/**/*',
            '__tests__/e2e/**/*',
        ],
        setupFiles: ['./vitest.setup.ts'],
        testTimeout: 30000,
        // Базовая последовательность файлов
        fileParallelism: false,
        sequence: {
            concurrent: false,
        },
    },
});
