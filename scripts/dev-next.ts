import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { existsSync } from 'node:fs';

// 1. Извлекаем переменные окружения из .env (аналог set -a; source .env)
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
    config({ path: envPath });
}

// 2. Логика выбора базы (DATABASE_URL — основная, TEST_DATABASE_URL — только если первая не задана)
const finalDbUrl = process.env.DATABASE_URL || process.env.TEST_DATABASE_URL;

const env = {
    ...process.env,
};

if (finalDbUrl) {
    env.DATABASE_URL = finalDbUrl;
}

const isWindows = process.platform === 'win32';

// 3. Синхронизируем базу данных
console.log('[dev:next] ⏳ Запуск pnpm db:sync...');
const syncResult = spawnSync('pnpm', ['db:sync', '--allow-production'], {
    stdio: 'inherit',
    env,
    shell: isWindows,
});

if (syncResult.status !== 0) {
    console.error(`[dev:next] ❌ pnpm db:sync упал с кодом ${syncResult.status}`);
    process.exit(syncResult.status ?? 1);
}

console.log('[dev:next] ✅ pnpm db:sync успешно завершен');

// 4. Запускаем локальный сервер Next.js
console.log('[dev:next] 🚀 Запуск Next.js (next dev --turbopack)...');
const devResult = spawnSync('pnpm', ['next', 'dev', '--turbopack'], {
    stdio: 'inherit',
    env,
    shell: isWindows,
});

if (devResult.status !== 0) {
    process.exit(devResult.status ?? 1);
}
