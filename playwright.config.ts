import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';


// Read from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const PORT = process.env.PORT || '3000';
const BASE_URL = `http://localhost:${PORT}`;
const WEB_SERVER_COMMAND = process.env.PLAYWRIGHT_WEB_SERVER_COMMAND || 'npm run dev:next';

export default defineConfig({
    testDir: './__tests__/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],
    webServer: {
        command: WEB_SERVER_COMMAND,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
